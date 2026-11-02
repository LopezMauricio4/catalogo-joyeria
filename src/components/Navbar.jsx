import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu as MenuIcon, Search, ShoppingCart, UserRound } from 'lucide-react';
import HeaderSearch from './HeaderSearch';
import ShopNavLink from './ShopNavLink';
import MobileCatalogMenu from './MobileCatalogMenu';
import BottomSheet from './BottomSheet';
import AccountMenu from './AccountMenu';
import usePressFeedback from '../hooks/usePressFeedback';
import { catalogSearchParams } from '../utils/catalog';
import '../styles/navigation.css';

export default function Navbar({ user, onLogout, searchOpen, setSearchOpen, cartCount = 0 }) {
  const [panel, setPanel] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHiddenOnScroll, setIsHiddenOnScroll] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const searchTrigger = useRef(null);
  const lastScrollY = useRef(window.scrollY);
  const pressFeedback = usePressFeedback('button, a');
  const isSearchOpen = searchOpen && location.pathname === '/catalogo';
  const isSearchEmpty = !(new URLSearchParams(location.search).get('q') || '').trim();
  const isLoggedIn = user && user.role !== 'guest';
  const closeMenu = useCallback(() => setPanel(current => current === 'menu' ? null : current), []);
  const closeAccount = useCallback(() => setPanel(current => current === 'account' ? null : current), []);
  const openPanel = name => {
    setSearchOpen(false);
    setIsHiddenOnScroll(false);
    setPanel(current => current === name ? null : name);
  };
  const toggleSearch = event => {
    searchTrigger.current = event.currentTarget;
    setPanel(null);
    setIsHiddenOnScroll(false);
    setSearchOpen(!isSearchOpen);
    if (!isSearchOpen) navigate({ pathname:'/catalogo', search:catalogSearchParams(new URLSearchParams(location.search).get('q') || '').toString() });
  };
  const closeSearch = () => { setSearchOpen(false); searchTrigger.current?.focus(); };
  const logout = async () => {
    setLoggingOut(true);
    try { await onLogout(); setPanel(null); }
    finally { setLoggingOut(false); }
  };

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) closeMenu(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [closeMenu]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 24);
      if (!panel && !isSearchOpen && !headerRef.current?.contains(document.activeElement)) {
        if (y > lastScrollY.current && y > 80) setIsHiddenOnScroll(true);
        if (y < lastScrollY.current || y <= 24) setIsHiddenOnScroll(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive:true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [panel, isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen || !isSearchEmpty) return;
    const closeEmptySearch = event => {
      if (!headerRef.current?.contains(event.target)) setSearchOpen(false);
    };
    window.addEventListener('wheel', closeEmptySearch, { passive:true });
    window.addEventListener('touchmove', closeEmptySearch, { passive:true });
    return () => {
      window.removeEventListener('wheel', closeEmptySearch);
      window.removeEventListener('touchmove', closeEmptySearch);
    };
  }, [isSearchOpen, isSearchEmpty, setSearchOpen]);

  const searchButton = <button type="button" className="nav-icon-button" aria-label="Buscar joyas" aria-expanded={isSearchOpen} aria-controls={isSearchOpen ? 'header-search' : undefined} onClick={toggleSearch}><Search size={21} strokeWidth={1.7} aria-hidden="true" /></button>;
  const cartButton = <Link to="/carrito" className="nav-icon-button cart-nav-link" aria-current={location.pathname === '/carrito' ? 'page' : undefined} aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'pieza' : 'piezas'}`}><ShoppingCart size={21} strokeWidth={1.7} aria-hidden="true" />{cartCount > 0 && <span className="cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}</Link>;
  const accountButton = <button type="button" className="nav-icon-button" aria-label="Abrir cuenta" aria-haspopup="dialog" aria-expanded={panel === 'account'} aria-controls="account-panel" onClick={() => openPanel('account')}><UserRound size={21} strokeWidth={1.7} aria-hidden="true" /></button>;

  return <>
    <header ref={headerRef} onFocusCapture={() => setIsHiddenOnScroll(false)} {...pressFeedback}
      className={`site-header sticky top-0 z-50 bg-ivory-soft transition-transform duration-300 ${isHiddenOnScroll && !isSearchOpen && !panel ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`navigation-bar flex items-center justify-between transition-[height] duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          <div className="mobile-navigation-bar lg:hidden">
            <div className="navigation-icons"><button type="button" className="nav-icon-button" aria-label="Abrir menú" aria-haspopup="dialog" aria-expanded={panel === 'menu'} aria-controls="mobile-menu" onClick={() => openPanel('menu')}><MenuIcon size={23} strokeWidth={1.7} aria-hidden="true" /></button>{searchButton}</div>
            <Link to="/" className="mobile-navigation-brand" aria-label="Alpez, inicio">ALPEZ</Link>
            <div className="navigation-icons">{cartButton}{accountButton}</div>
          </div>
          <Link to="/" className="hidden shrink-0 items-center lg:flex" aria-label="Alpez, inicio"><span className="font-display text-4xl font-semibold tracking-[0.16em] text-ink-soft">ALPEZ</span></Link>
          <nav aria-label="Navegación principal" className="desktop-shop-nav hidden items-center gap-5 text-sm text-ink-soft lg:flex">
            {searchButton}<ShopNavLink to="/">Inicio</ShopNavLink><ShopNavLink to="/catalogo">Catálogo</ShopNavLink><ShopNavLink to="/catalogo?material=oro-18k">Oro 18k</ShopNavLink><ShopNavLink to="/catalogo?material=laminado">Oro laminado 18k</ShopNavLink>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">{cartButton}{accountButton}</div>
        </div>
      </div>
      {isSearchOpen && <HeaderSearch onClose={closeSearch} />}
    </header>

    <BottomSheet id="mobile-menu" open={panel === 'menu'} onClose={closeMenu} title="Explora Alpez" closeLabel="Cerrar menú" className="navigation-sheet" mobileBreakpoint={1023}>
      <div className="navigation-sheet-content">
        <nav className="mobile-menu-links" aria-label="Navegación móvil">
          <ShopNavLink to="/" onClick={closeMenu}>Inicio <ArrowRight size={18} aria-hidden="true" /></ShopNavLink>
          <MobileCatalogMenu onNavigate={closeMenu} />
          <ShopNavLink to="/carrito" onClick={closeMenu}>Mi carrito <ArrowRight size={18} aria-hidden="true" /></ShopNavLink>
          <ShopNavLink to="/garantias-y-cambios" onClick={closeMenu}>Garantías y cambios <ArrowRight size={18} aria-hidden="true" /></ShopNavLink>
        </nav>
        <div className="mobile-menu-account">
          <p>{isLoggedIn ? `Hola, ${user.userName || 'bienvenido'}` : 'Tu cuenta en Alpez'}</p>
          {isLoggedIn ? <button type="button" className="navigation-action navigation-action-primary" onClick={() => setPanel('account')}>Ver mi cuenta <UserRound size={18} aria-hidden="true" /></button> : <>
            <Link className="navigation-action navigation-action-primary" to="/auth" onClick={closeMenu}>Iniciar sesión <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="navigation-action navigation-action-secondary" to="/auth?mode=register" onClick={closeMenu}>Crear cuenta</Link>
          </>}
        </div>
      </div>
    </BottomSheet>
    <BottomSheet id="account-panel" open={panel === 'account'} onClose={closeAccount} title={isLoggedIn ? 'Tu cuenta' : 'Bienvenido a Alpez'} closeLabel="Cerrar cuenta" className="account-sheet" returnFocusSelector={'button[aria-controls="account-panel"]'}>
      <AccountMenu user={user} onNavigate={closeAccount} onLogout={logout} loggingOut={loggingOut} />
    </BottomSheet>
  </>;
}
