import ShopNavLink from './ShopNavLink';
import { useMatch } from 'react-router-dom';

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/carrito", label: "Mi carrito" },
  { to: "/catalogo?material=oro-18k", label: "Oro 18k" },
  { to: "/catalogo?material=laminado", label: "Oro laminado 18k" },
];

const SocialIcon = ({ type }) => {
  if (type === "instagram") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" /></svg>;
  }
  if (type === "tiktok") {
    return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M15.5 3h3c.2 1.8 1.2 3.1 3 3.6v3.1c-1.1-.1-2.1-.5-3-1.1v6.1a6.3 6.3 0 1 1-5.4-6.2v3.2a3.1 3.1 0 1 0 2.3 3V3Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.67.33-1 1-1Z" /></svg>;
};

const Footer = () => {
  const isProductDetail = useMatch('/producto/:id');
  const year = new Date().getFullYear();
  if (isProductDetail) return null;

  return (
    <footer className="border-t border-forest-800 bg-forest-900 text-ivory-soft/90">
      {/* Franja superior — línea firma en dorado */}
      <div className="mx-auto max-w-7xl px-6 pt-14">
        <div className="luxury-divider">
          <span className="luxury-divider-mark" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
        {/* Marca */}
        <div>
          <span className="font-display text-4xl tracking-[0.18em] text-white uppercase">ALPEZ</span>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.instagram.com/joyeria.alpez?stkn=dnp3ZTN4MGFuZ2Fk"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory-soft/80 transition hover:border-gold-400 hover:text-gold-400"
            >
              <SocialIcon type="instagram" />
            </a>
            <a
              href="https://www.facebook.com/share/1Qe6N4rkDB/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory-soft/80 transition hover:border-gold-400 hover:text-gold-400"
            >
              <SocialIcon type="facebook" />
            </a>
            <a
              href="https://www.tiktok.com/@alpez.joyeria?_r=1&_t=ZS-99so7HcoYXI"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ivory-soft/80 transition hover:border-gold-400 hover:text-gold-400"
            >
              <SocialIcon type="tiktok" />
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold-400">Navegación</p>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                <ShopNavLink to={link.to} className="footer-nav-link">
                  {link.label}
                </ShopNavLink>
              </li>
            ))}
          </ul>
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
