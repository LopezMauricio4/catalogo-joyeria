import SocialIcon from './SocialIcon';
import ShopNavLink from './ShopNavLink';
import { Link, useMatch } from 'react-router-dom';
import { business, PRIVACY_PATH, SIC_URL } from '../data/legal';
import { buildWhatsAppLink } from '../utils/whatsappGenerator';

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/carrito", label: "Mi carrito" },
  { to: "/catalogo?material=oro-18k", label: "Oro 18k" },
  { to: "/catalogo?material=laminado", label: "Oro laminado 18k" },
];

const Footer = () => {
  const isProductDetail = useMatch('/producto/:id');
  const year = new Date().getFullYear();
  if (isProductDetail) return null;

  return (
    <footer className="site-footer bg-forest-900 text-ivory-soft">
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
              className="flex h-10 w-10 items-center justify-center text-ivory-soft/80 transition hover:text-gold-400"
            >
              <SocialIcon type="instagram" />
            </a>
            <a
              href="https://www.facebook.com/share/1Qe6N4rkDB/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center text-ivory-soft/80 transition hover:text-gold-400"
            >
              <SocialIcon type="facebook" />
            </a>
            <a
              href="https://www.tiktok.com/@alpez.joyeria?_r=1&_t=ZS-99so7HcoYXI"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok de Alpez Joyería"
              className="flex h-10 w-10 items-center justify-center text-ivory-soft/80 transition hover:text-gold-400"
            >
              <SocialIcon type="tiktok" />
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <h2 className="footer-heading">Navegación</h2>
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


        <div className="footer-contact">
          <h2 className="footer-heading">Contacto e información legal</h2>
          <p>Responsables:</p>
          {business.responsiblePeople.map(person => <p key={person.identification}>{person.name} · {person.identification}</p>)}
          {business.nit && <p>NIT: {business.nit}</p>}
          {business.address && <p>Dirección de notificaciones: {business.address}</p>}
          {business.email && <a href={`mailto:${business.email}`}>{business.email}</a>}
          <a href={buildWhatsAppLink('Hola. Quisiera atención sobre una compra o solicitud.')} target="_blank" rel="noopener noreferrer">WhatsApp: {business.phone}</a>
          <Link to={PRIVACY_PATH}>Política de Tratamiento de Datos Personales</Link>
          <Link to="/terminos-y-condiciones">Términos y Condiciones</Link>
          <Link to="/garantias-y-cambios">Garantías y cambios</Link>
          <a href={SIC_URL} target="_blank" rel="noopener noreferrer">Protección al consumidor — SIC</a>
        </div>
      </div>

      {/* Franja legal */}
      <div className="footer-legal">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center text-[11px] text-ivory-soft/50 sm:flex-row sm:justify-between sm:text-left">
          <p>© {year} Alpez Joyería. Todos los derechos reservados.</p>
          <p className="tracking-[0.14em] uppercase text-ivory-soft/40">Oro 18k · Oro laminado 18k</p>
        </div>
        <p className="px-6 pb-5 text-center text-[11px] text-ivory-soft/60">Iconos: <a className="underline" href="https://www.flaticon.es/iconos-gratis/popular" target="_blank" rel="noopener noreferrer">Indygo</a> · <a className="underline" href="https://www.flaticon.es/iconos-gratis/tik-tok" target="_blank" rel="noopener noreferrer">TikTok por Magnific</a> · <a className="underline" href="https://www.flaticon.es/iconos-gratis/whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp por Magnific</a> — Flaticon</p>
      </div>
    </footer>
  );
};

export default Footer;
