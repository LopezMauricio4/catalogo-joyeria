import { ArrowUpRight } from 'lucide-react';
import SocialIcon from './SocialIcon';

const profileUrl = 'https://www.instagram.com/joyeria.alpez/';

export default function InstagramProfile() {
  return <section className="instagram-section bg-stone" aria-labelledby="instagram-heading">
    <div className="instagram-layout mx-auto max-w-7xl">
      <div className="instagram-copy">
        <p className="luxury-eyebrow"><SocialIcon type="instagram" size={20} />SÍGUENOS EN INSTAGRAM</p>
        <h2 id="instagram-heading">@joyeria.alpez</h2>
        <p>Descubre nuestras publicaciones, novedades y momentos de Alpez.</p>
        <a className="shop-text-link" href={profileUrl} target="_blank" rel="noopener noreferrer">Ver perfil en Instagram <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="instagram-preview">
        <iframe src={`${profileUrl}embed/`} title="Perfil de Instagram de Joyería Alpez y sus publicaciones" loading="lazy" scrolling="no" />
        <p>Si la vista previa no aparece, <a href={profileUrl} target="_blank" rel="noopener noreferrer">abre nuestro perfil en Instagram</a>.</p>
      </div>
    </div>
  </section>;
}
