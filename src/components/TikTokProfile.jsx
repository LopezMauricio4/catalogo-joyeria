import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import SocialIcon from './SocialIcon';
import { readTikTokPlayerState, tikTokProfileUrl, tikTokVideos } from '../utils/tiktok';

function VideoPreview({ video }) {
  const container = useRef(null);
  const frame = useRef(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); observer.disconnect(); }
    }, { rootMargin: '300px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setStatus('unavailable'), 12000);
    const receive = event => {
      const next = readTikTokPlayerState(event, frame.current?.contentWindow);
      if (!next) return;
      window.clearTimeout(timer);
      setStatus(next);
    };
    window.addEventListener('message', receive);
    return () => { window.clearTimeout(timer); window.removeEventListener('message', receive); };
  }, [active]);

  const videoUrl = `${tikTokProfileUrl}/video/${video.id}`;
  return <div ref={container} className="tiktok-video-card">
    <div className="tiktok-video-stage" data-state={status} aria-busy={active && status === 'loading'}>
      {active && <iframe ref={frame}
        src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=0&rel=0&description=1`}
        title={`${video.label} de Alpez en TikTok`} allow="fullscreen" allowFullScreen
        className={status === 'ready' ? 'is-ready' : ''}
        tabIndex={status === 'ready' ? 0 : -1} aria-hidden={status !== 'ready'}
        onError={() => setStatus('unavailable')} />}
      {status !== 'ready' && <div className="tiktok-video-fallback">
        <SocialIcon type="tiktok" size={42} />
        <span className="shop-eyebrow">ALPEZ EN TIKTOK</span>
        <h3>Nuestras joyas en movimiento</h3>
        <p role="status">{status === 'loading' ? 'Preparando la vista previa… También puedes abrir el video en TikTok.' : 'La vista previa no está disponible en este momento. Puedes ver el video directamente en TikTok.'}</p>
        <a className="shop-button" href={videoUrl} target="_blank" rel="noopener noreferrer"><Play size={16} aria-hidden="true" />Ver video en TikTok</a>
      </div>}
    </div>
    <a className="tiktok-video-link" href={videoUrl} target="_blank" rel="noopener noreferrer">Ver este video en TikTok <ArrowUpRight size={15} aria-hidden="true" /></a>
  </div>;
}

export default function TikTokProfile() {
  const [selected, setSelected] = useState(0);
  return <section className="instagram-section tiktok-section" aria-labelledby="tiktok-heading">
    <div className="instagram-layout mx-auto max-w-7xl">
      <div className="instagram-copy">
        <p className="luxury-eyebrow"><SocialIcon type="tiktok" size={20} />SÍGUENOS EN TIKTOK</p>
        <h2 id="tiktok-heading">@alpez.joyeria</h2>
        <p>Conoce nuestras joyas en movimiento y descubre los videos de Alpez.</p>
        <a className="shop-text-link" href={tikTokProfileUrl} target="_blank" rel="noopener noreferrer">Ver perfil en TikTok <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="tiktok-preview">
        <div className="tiktok-video-picker" role="group" aria-label="Elegir video de Alpez">
          {tikTokVideos.map((video, index) => <button key={video.id} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{video.label}</button>)}
        </div>
        <VideoPreview key={tikTokVideos[selected].id} video={tikTokVideos[selected]} />
      </div>
    </div>
  </section>;
}
