import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { mapSupabaseUser, signIn, signUp } from "../services/authApi";

// useToast requiere <ToastProvider> envolviendo App.jsx.
// Si aún no lo agregaste, esto no rompe la página, solo no muestra el toast.
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { showToast: () => {} };
  }
};

const AuthPage = ({ onLogin, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useSafeToast();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const email = form.email.trim().toLowerCase();
      if (!email || !form.password.trim()) throw new Error("Ingresa tu correo y contraseña.");

      if (mode === "register") {
        if (!form.name.trim()) throw new Error("Ingresa tu nombre completo.");
        if (form.password !== form.confirmPassword) throw new Error("Las contraseñas no coinciden.");

        const { session, user: registeredUser } = await signUp(form.name.trim(), email, form.password);
        if (!session) {
          showToast("Revisa tu correo para confirmar la cuenta.", "success");
          setMode("login");
          return;
        }

        const nextUser = mapSupabaseUser(registeredUser);
        onLogin(nextUser);
        showToast(`Bienvenida, ${nextUser.userName}`, "success");
        navigate("/");
        return;
      }

      const signedInUser = await signIn(email, form.password);
      const nextUser = mapSupabaseUser(signedInUser);
      onLogin(nextUser);
      showToast(`Bienvenida de nuevo, ${nextUser.userName}`, "success");
      navigate(nextUser.role === "admin" ? "/admin/productos" : "/");
    } catch (submitError) {
      setError(submitError.message || "No se pudo completar la autenticación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && user.role !== "guest" && location.pathname === "/auth") {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <p className="luxury-eyebrow">Cuenta activa</p>
        <h1 className="mt-4 text-4xl font-light text-ink-soft">
          Ya has iniciado sesión como {user.userName}
        </h1>
        <Link to="/" className="luxury-btn luxury-btn-primary mt-6">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-card-lg border border-line bg-white p-6 shadow-sm md:p-10">
        <div className="mb-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-pill px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition ${
              mode === "login" ? "bg-forest-900 text-white" : "border border-line bg-ivory-soft text-ink-muted"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-pill px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition ${
              mode === "register" ? "bg-forest-900 text-white" : "border border-line bg-ivory-soft text-ink-muted"
            }`}
          >
            Registrarse
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-3xl bg-ivory p-6">
            <p className="luxury-eyebrow">Acceso</p>
            <h1 className="mt-4 text-4xl font-light text-ink-soft">
              {mode === "login" ? "Bienvenido" : "Crea tu cuenta"}
            </h1>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              {mode === "login"
                ? "Consulta piezas, guarda tu experiencia y accede a tu perfil de cliente."
                : "Regístrate para comprar o consultar piezas y para acceder a tu perfil de cliente."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <label className="block text-sm text-ink-muted">
                Nombre completo
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="Tu nombre"
                />
              </label>
            )}

            <label className="block text-sm text-ink-muted">
              Correo electrónico
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                placeholder="tucorreo@mail.com"
              />
            </label>

            <label className="block text-sm text-ink-muted">
              Contraseña
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 pr-11 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-ink-soft"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label className="block text-sm text-ink-muted">
                Confirmar contraseña
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="Repite tu contraseña"
                />
              </label>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="luxury-btn luxury-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
