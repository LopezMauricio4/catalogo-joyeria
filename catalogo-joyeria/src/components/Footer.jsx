import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import BrandMark from "./BrandMark";
import { buildWhatsAppLink } from "../utils/whatsappGenerator";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/catalogo?material=oro-18k", label: "Oro 18k" },
  { to: "/catalogo?material=laminado", label: "Oro laminado 18k" },
];

const helpLinks = [
  { to: "/catalogo", label: "Preguntas frecuentes" },
  { to: "/catalogo", label: "Envíos y cambios" },
  { to: "/catalogo", label: "Garantía" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const whatsappLink = buildWhatsAppLink("Hola, quiero más información sobre sus piezas.");
  const year = new Date().getFullYear();

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="border-t border-forest-800 bg-forest-900 text-ivory-soft/90">
      {/* Franja superior — línea firma en dorado */}
      <div className="mx-auto max-w-7xl px-6 pt-14">
        <div className="luxury-divider">
          <span className="luxury-divider-mark" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr]">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-3">
            <BrandMark size={40} tone="dark" />
            <span className="font-display text-2xl tracking-[0.14em] text-white uppercase">Alpez</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-ivory-soft/70">
            Joyería fina en oro 18k y oro laminado 18k. Piezas pensadas para acompañar los momentos que
            importan.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory-soft/80 transition hover:border-gold-400 hover:text-gold-400"
            >
              <span className="text-xs font-semibold" aria-hidden="true">IG</span>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory-soft/80 transition hover:border-gold-400 hover:text-gold-400"
            >
              <span className="text-base font-semibold" aria-hidden="true">f</span>
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory-soft/80 transition hover:border-gold-400 hover:text-gold-400"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold-400">Navegación</p>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-ivory-soft/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Atención al cliente */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold-400">Atención al cliente</p>
          <ul className="mt-5 space-y-3">
            {helpLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-ivory-soft/75 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-ivory-soft/75 transition hover:text-white"
              >
                Escríbenos por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold-400">Mantente al día</p>
          <p className="mt-5 text-sm leading-6 text-ivory-soft/70">
            Recibe primero las nuevas colecciones y piezas destacadas.
          </p>

          {subscribed ? (
            <p className="mt-4 text-sm text-gold-400">Gracias — te avisaremos por correo.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-4 flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Tu correo electrónico"
                className="w-full min-w-0 rounded-pill border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-ivory-soft/40 outline-none transition focus:border-gold-400"
              />
              <button
                type="submit"
                aria-label="Suscribirme"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400 text-forest-900 transition hover:bg-gold-300"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Franja legal */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center text-[11px] text-ivory-soft/50 sm:flex-row sm:justify-between sm:text-left">
          <p>© {year} Alpez Joyería. Todos los derechos reservados.</p>
          <p className="tracking-[0.14em] uppercase text-ivory-soft/40">Oro 18k · Oro laminado 18k</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
