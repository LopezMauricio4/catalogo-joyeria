import { useState } from 'react';
import { Gem } from 'lucide-react';

let loadingImageObserver;

function observeLoadingImage(image) {
  if (!image || image.complete || typeof IntersectionObserver === 'undefined') return;

  loadingImageObserver ??= new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.photoInView = '';
      observer.unobserve(entry.target);
    }
  });

  loadingImageObserver.observe(image);
  return () => loadingImageObserver.unobserve(image);
}

function ImageAsset({ src, alt, className = '', eager = false, loadingLabel }) {
  const [status, setStatus] = useState('loading');
  if (!src || status === 'error') return <div role="img" aria-label={`${alt}: imagen no disponible`} className={`product-image-placeholder ${className}`}><Gem size={30} strokeWidth={1} /><span>Imagen por actualizar</span></div>;

  const showLoading = Boolean(loadingLabel) && status === 'loading';
  return <>
    <img
      ref={showLoading ? observeLoadingImage : undefined}
      src={src}
      alt={alt}
      className={`product-photo ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      data-photo-loading={showLoading ? '' : undefined}
      onLoad={showLoading ? () => setStatus('loaded') : undefined}
      onError={() => setStatus('error')}
    />
    {showLoading && <span className="product-image-loading-label" aria-hidden="true">{loadingLabel}</span>}
  </>;
}
export default function ProductImage(props) {
  return <ImageAsset key={props.src} {...props} />;
}
