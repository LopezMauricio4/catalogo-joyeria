import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import SocialIcon from './SocialIcon';

const profileUrl = 'https://www.tiktok.com/@alpez.joyeria';

export default function TikTokProfile() {
  const preview = useRef(null);
  useEffect(() => {
    const container = preview.current;
    // TikTok owns the contents of this container so React never reconciles its embed.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const quote = document.createElement('blockquote');
      quote.className = 'tiktok-embed';
      quote.setAttribute('cite', profileUrl);
      quote.setAttribute('data-unique-id', 'alpez.joyeria');
      quote.setAttribute('data-embed-type', 'creator');
      quote.setAttribute('data-embed-from', 'oembed');
      const section = document.createElement('section');
      const link = document.createElement('a');
      link.href = profileUrl;
      link.textContent = '@alpez.joyeria';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      section.append(link);
      quote.append(section);
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      container.append(quote, script);
    }, { rootMargin: '300px' });
    observer.observe(container);
    return () => { observer.disconnect(); container.replaceChildren(); };
  }, []);

  return <section className="instagram-section tiktok-section" aria-labelledby="tiktok-heading">
    <div className="instagram-layout mx-auto max-w-7xl">
      <div className="instagram-copy">
        <p className="luxury-eyebrow"><SocialIcon type="tiktok" size={20} />SÍGUENOS EN TIKTOK</p>
        <h2 id="tiktok-heading">@alpez.joyeria</h2>
        <p>Conoce nuestras joyas en movimiento y descubre los videos de Alpez.</p>
        <a className="shop-text-link" href={profileUrl} target="_blank" rel="noopener noreferrer">Ver perfil en TikTok <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="tiktok-preview">
        <div ref={preview} className="tiktok-embed-container" />
        <p>Si la vista previa no aparece, <a href={profileUrl} target="_blank" rel="noopener noreferrer">abre nuestro perfil en TikTok</a>.</p>
      </div>
    </div>
  </section>;
}
