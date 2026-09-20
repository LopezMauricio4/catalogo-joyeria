import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu as MenuIcon, X } from "lucide-react";
import BrandMark from "./BrandMark";
import { buildWhatsAppLink } from "../utils/whatsappGenerator";

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const collectionsRef = useRef(null);

  const whatsappLink = buildWhatsAppLink("Hola, quiero asesoría para comprar joyería.");
  const isLoggedIn = user && user.role !== "guest";

  // Navbar se comprime al hacer scroll — detalle sutil de sitios de alta gama
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra el submenú "Colecciones" al hacer click fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target)) {
        setIsCollectionsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsCollectionsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-ivory-soft/90 backdrop-blur-md transition-all duration-300 ${
        isScrolled ? "border-line shadow-[0_10px_30px_rgba(11,37,27,0.05)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16" : "h-20"
          }`}
        >
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size={isScrolled ? 32 : 38} tone="light" className="transition-all duration-300" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-[0.14em] text-ink-soft uppercase sm:text-2xl">
                Alpez
              </span>
              <span className="mt-1 text-[8px] tracking-[0.32em] text-forest-600 font-medium uppercase">
                Joyería Fina
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[10px] tracking-[0.22em] uppercase text-ink-muted md:flex">
            <Link to="/" className="transition hover:text-ink-soft">
              Inicio
            </Link>
            <Link to="/catalogo" className="transition hover:text-ink-soft">
              Catálogo
            </Link>

            <div className="relative" ref={collectionsRef}>
              <button
                type="button"
                onClick={() => setIsCollectionsOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isCollectionsOpen}
                className="flex items-center gap-1.5 transition hover:text-ink-soft"
              >
                Colecciones
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    isCollectionsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                role="menu"
                className={`absolute left-1/2 top-full mt-3 w-52 -translate-x-1/2 rounded-2xl border border-line bg-ivory-soft p-2 shadow-[0_22px_45px_rgba(11,37,27,0.1)] transition-all duration-200 ${
                  isCollectionsOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <Link
                  to="/catalogo?material=oro-18k"
                  onClick={() => setIsCollectionsOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-left normal-case tracking-normal text-ink-soft transition hover:bg-sand/50"
                >
                  <span className="block text-sm font-medium">Oro 18k</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">Piezas sólidas</span>
                </Link>
                <Link
                  to="/catalogo?material=laminado"
                  onClick={() => setIsCollectionsOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-left normal-case tracking-normal text-ink-soft transition hover:bg-sand/50"
                >
                  <span className="block text-sm font-medium">Oro Laminado 18k</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">Uso diario</span>
                </Link>
              </div>
            </div>

            {user?.role === "admin" && (
              <Link to="/admin/productos" className="transition hover:text-ink-soft">
                Crear productos
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  {user.userName || "Cuenta"}
                </span>
                {user.role === "admin" && (
                  <Link
                    to="/admin/productos"
                    className="rounded-pill border border-line-strong bg-white px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-ink-soft transition hover:border-gold-400"
                  >
                    Panel admin
                  </Link>
                )}
                <button type="button" onClick={onLogout} className="luxury-btn luxury-btn-primary">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/auth" className="luxury-btn luxury-btn-primary">
                Registrarse / Iniciar sesión
              </Link>
            )}

            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="luxury-btn luxury-btn-secondary">
              Asesoría WhatsApp
            </a>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-11 w-11 items-center justify-center text-ink-soft focus:outline-none"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={`overflow-hidden bg-forest-900 transition-[max-height] duration-300 ease-luxury md:hidden ${
          isOpen ? "max-h-[36rem]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-6">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="rounded-xl py-3 text-center text-[11px] tracking-[0.22em] uppercase text-ivory-soft/90 transition hover:bg-white/5"
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            onClick={() => setIsOpen(false)}
            className="rounded-xl py-3 text-center text-[11px] tracking-[0.22em] uppercase text-ivory-soft/90 transition hover:bg-white/5"
          >
            Catálogo
          </Link>

          <div className="luxury-divider py-3">
            <span className="luxury-divider-mark" />
          </div>

          <Link
            to="/catalogo?material=oro-18k"
            onClick={() => setIsOpen(false)}
            className="rounded-xl py-3 text-center text-[11px] tracking-[0.22em] uppercase text-ivory-soft/90 transition hover:bg-white/5"
          >
            Oro 18k
          </Link>
          <Link
            to="/catalogo?material=laminado"
            onClick={() => setIsOpen(false)}
            className="rounded-xl py-3 text-center text-[11px] tracking-[0.22em] uppercase text-ivory-soft/90 transition hover:bg-white/5"
          >
            Oro Laminado 18k
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin/productos"
              onClick={() => setIsOpen(false)}
              className="rounded-xl py-3 text-center text-[11px] tracking-[0.22em] uppercase text-ivory-soft/90 transition hover:bg-white/5"
            >
              Crear productos
            </Link>
          )}

          <div className="mt-3 flex flex-col gap-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="luxury-btn luxury-btn-primary w-full !bg-gold-400 !text-forest-900"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="luxury-btn w-full !bg-gold-400 !text-forest-900"
              >
                Registrarse / Iniciar sesión
              </Link>
            )}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="luxury-btn w-full border border-white/20 !bg-transparent !text-ivory-soft"
            >
              Asesoría WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
