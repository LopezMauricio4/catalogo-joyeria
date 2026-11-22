import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import SocialIcon from './SocialIcon';

const profileUrl = 'https://www.instagram.com/joyeria.alpez/';

export default function InstagramProfile() {
  const [expanded, setExpanded] = useState(false);
  return <section className="instagram-section bg-stone" aria-labelledby="instagram-heading">
    <div className="instagram-layout mx-auto max-w-7xl">
      <div className="instagram-copy">
        <h2 id="instagram-heading"><SocialIcon type="instagram" size={24} />@joyeria.alpez</h2>
        <p>Descubre nuestras publicaciones, novedades y momentos de Alpez.</p>
        <a className="shop-text-link" href={profileUrl} target="_blank" rel="noopener noreferrer">Ver perfil en Instagram <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="instagram-preview">
        <button type="button" className="shop-button shop-button-secondary" aria-expanded={expanded} aria-controls="instagram-publicaciones" onClick={() => setExpanded(value => !value)}>
          {expanded ? 'Ocultar publicaciones' : 'Mostrar publicaciones'}
        </button>
        <div id="instagram-publicaciones" hidden={!expanded}>
          {expanded && <iframe src={`${profileUrl}embed/`} title="Perfil de Instagram de Joyería Alpez y sus publicaciones" scrolling="no" />}
        </div>
        {expanded && <p>Si la vista previa no aparece, <a href={profileUrl} target="_blank" rel="noopener noreferrer">abre nuestro perfil en Instagram</a>.</p>}
      </div>
    </div>
  </section>;
}
