import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Search, ShoppingBag, UserRound, X } from "lucide-react";
import HeaderSearch from './HeaderSearch';
import ShopNavLink from './ShopNavLink';
import { buildWhatsAppLink } from '../utils/whatsappGenerator';

const Navbar = ({ user, onLogout, searchOpen, setSearchOpen, cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isSearchOpen = searchOpen && location.pathname === '/catalogo';
  const isSearchEmpty = !(new URLSearchParams(location.search).get('q') || '').trim();
  const searchTrigger = useRef(null);
  const toggleSearch = event => {
    searchTrigger.current = event.currentTarget;
    setIsOpen(false);
    setIsAccountOpen(false);
    setIsHiddenOnScroll(false);
    setSearchOpen(!isSearchOpen);
    if (!isSearchOpen && location.pathname !== '/catalogo') navigate('/catalogo');
  };
  const closeSearch = () => {
    setSearchOpen(false);
    searchTrigger.current?.focus();
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHiddenOnScroll, setIsHiddenOnScroll] = useState(false);
  const lastScrollY = useRef(window.scrollY);
  const headerRef = useRef(null);

  const isLoggedIn = user && user.role !== "guest";
  const searchButton = <button type="button" className="shop-icon-button text-ink-soft" aria-label="Buscar joyas" aria-expanded={isSearchOpen} aria-controls="header-search" onClick={toggleSearch}><Search size={20} strokeWidth={1.8} /></button>;
  const cartButton = <Link to="/carrito" className="shop-icon-button cart-nav-link text-ink-soft" aria-current={location.pathname === '/carrito' ? 'page' : undefined} aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'pieza' : 'piezas'}`} onClick={() => { setIsOpen(false); setIsAccountOpen(false); }}><ShoppingBag size={21} strokeWidth={1.7} />{cartCount > 0 && <span className="cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}</Link>;

  const toggleMobileMenu = () => {
    setIsOpen((open) => !open);
    setIsAccountOpen(false);
  };

  // Navbar se comprime al hacer scroll — detalle sutil de sitios de alta gama
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 80;
      const scrollingUp = currentScrollY < lastScrollY.current;

      setIsScrolled(currentScrollY > 24);
      if (!isOpen && !isAccountOpen && !isSearchOpen) {
        if (scrollingDown) setIsHiddenOnScroll(true);
        if (scrollingUp || currentScrollY <= 24) setIsHiddenOnScroll(false);
      }
      lastScrollY.current = currentScrollY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen, isAccountOpen, isSearchOpen]);

  useEffect(() => {
    const closeEmptySearch = isSearchOpen && isSearchEmpty;
    if (!isOpen && !isAccountOpen && !closeEmptySearch) return undefined;

    const closeOnUserScroll = () => {
      setIsOpen(false);
      setIsAccountOpen(false);
      if (closeEmptySearch) setSearchOpen(false);
    };

    window.addEventListener("wheel", closeOnUserScroll, { passive: true });
    window.addEventListener("touchmove", closeOnUserScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", closeOnUserScroll);
      window.removeEventListener("touchmove", closeOnUserScroll);
    };
  }, [isOpen, isAccountOpen, isSearchOpen, isSearchEmpty, setSearchOpen]);

  // Cierra los paneles flotantes al hacer click fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAccountOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsAccountOpen(false);
      }
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
      ref={headerRef}
      className={`sticky top-0 z-50 border-b bg-ivory-soft/90 backdrop-blur-md transition-all duration-300 ${
        isHiddenOnScroll && !isSearchOpen ? "-translate-y-full" : "translate-y-0"
      } ${
        isScrolled ? "border-line shadow-[0_10px_30px_rgba(11,37,27,0.05)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16" : "h-20"
          }`}
        >
          <div className="flex w-full items-center justify-between lg:hidden">
            <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="flex h-11 w-11 items-center justify-center text-ink-soft focus:outline-none"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
            {searchButton}
            </div>

            <Link to="/" className="absolute left-1/2 flex -translate-x-1/2 items-center" aria-label="Alpez, inicio">
              <span className="font-display text-2xl tracking-[0.16em] text-ink-soft uppercase">ALPEZ</span>
            </Link>

            <div className="flex items-center gap-1">
              {cartButton}
              <button
                type="button"
                onClick={() => {
                  setIsAccountOpen((open) => !open);
                  setIsOpen(false);
                }}
                className="flex h-11 w-11 items-center justify-center text-ink-soft focus:outline-none"
                aria-label="Abrir cuenta"
                aria-expanded={isAccountOpen}
                aria-controls="account-panel"
              >
                <UserRound size={20} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <Link
            to="/"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
            aria-label="Alpez, inicio"
          >
            <span className="font-display text-4xl font-semibold tracking-[0.16em] text-ink-soft uppercase">ALPEZ</span>
          </Link>

          <nav className="desktop-shop-nav hidden items-center gap-5 text-[11px] tracking-[0.1em] uppercase text-ink-muted lg:flex">
            {searchButton}
            <ShopNavLink to="/">
              Inicio
            </ShopNavLink>
            <ShopNavLink to="/catalogo">
              Catálogo
            </ShopNavLink>

            <ShopNavLink to="/catalogo?material=oro-18k">
              Oro 18k
            </ShopNavLink>
            <ShopNavLink to="/catalogo?material=laminado">
              Oro laminado 18k
            </ShopNavLink>

          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {cartButton}
            {user?.role === "admin" && (
              <Link
                to="/admin/productos"
                className="rounded-pill border border-line-strong px-4 py-2 text-[9px] font-medium uppercase tracking-[0.16em] text-ink-soft transition hover:border-forest-400 hover:bg-forest-50"
              >
                Crear productos
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setIsAccountOpen((open) => !open);
                setIsOpen(false);
              }}
              className="flex h-11 w-11 items-center justify-center text-ink-soft focus:outline-none"
              aria-label="Abrir cuenta"
              aria-expanded={isAccountOpen}
              aria-controls="account-panel"
            >
              <UserRound size={21} strokeWidth={1.7} />
            </button>
          </div>

        </div>
      </div>

      {isSearchOpen && <HeaderSearch onClose={closeSearch} />}

      <div
        id="account-panel"
        inert={!isAccountOpen}
        aria-hidden={!isAccountOpen}
        className={`absolute right-4 top-full w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-line bg-ivory-soft p-5 shadow-[0_18px_40px_rgba(11,37,27,0.12)] transition-all duration-200 lg:right-8 ${
          isAccountOpen ? "pointer-events-auto translate-y-2 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {isLoggedIn ? (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Tu cuenta</p>
            <p className="mt-2 font-display text-2xl text-ink-soft">{user.userName || "Cuenta"}</p>
            <p className="mt-1 truncate text-sm text-ink-muted">{user.email}</p>
            <div className="mt-5 flex flex-col gap-2">
              {user.role === "admin" && (
                <Link
                  to="/admin/productos"
                  onClick={() => setIsAccountOpen(false)}
                  className="rounded-xl border border-line px-4 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-ink-soft"
                >
                  Panel admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setIsAccountOpen(false);
                }}
                className="luxury-btn luxury-btn-primary w-full"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Acceso</p>
            <p className="mt-2 font-display text-2xl text-ink-soft">Bienvenido</p>
            <div className="mt-5 flex gap-2">
              <Link
                to="/auth"
                onClick={() => setIsAccountOpen(false)}
                className="luxury-btn luxury-btn-primary flex-1 px-3!"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/auth?mode=register"
                onClick={() => setIsAccountOpen(false)}
                className="luxury-btn luxury-btn-secondary flex-1 px-3!"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Menú móvil */}
      <div
        id="mobile-menu"
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={`absolute left-0 right-0 top-full overflow-hidden border-t border-line bg-white shadow-[0_18px_30px_rgba(11,37,27,0.08)] transition-[max-height] duration-300 ease-luxury lg:hidden ${
          isOpen ? "max-h-144" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-left text-[11px] tracking-[0.22em] uppercase text-forest-800 transition hover:bg-forest-50"
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-left text-[11px] tracking-[0.22em] uppercase text-forest-800 transition hover:bg-forest-50"
          >
            Catálogo
          </Link>

          <div className="my-2 h-px bg-forest-100" />

          <Link
            to="/catalogo?material=oro-18k"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-left text-[11px] tracking-[0.22em] uppercase text-forest-800 transition hover:bg-forest-50"
          >
            Oro 18k
          </Link>
          <Link
            to="/catalogo?material=laminado"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-left text-[11px] tracking-[0.22em] uppercase text-forest-800 transition hover:bg-forest-50"
          >
            Oro Laminado 18k
          </Link>
          <Link
            to="/garantias-y-cambios"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-3 text-left text-[11px] tracking-[0.22em] uppercase text-forest-800 transition hover:bg-forest-50"
          >
            Garantías y cambios
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin/productos"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-4 py-3 text-left text-[11px] tracking-[0.22em] uppercase text-forest-800 transition hover:bg-forest-50"
            >
              Crear productos
            </Link>
          )}

          <div className="mt-4 flex flex-col gap-2 border-t border-forest-100 pt-4">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="luxury-btn luxury-btn-primary w-full"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="luxury-btn luxury-btn-primary w-full"
              >
                Registrarse / Iniciar sesión
              </Link>
            )}

          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
