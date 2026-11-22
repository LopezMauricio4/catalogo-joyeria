import { useState } from 'react';
import { Gem } from 'lucide-react';

let loadingImageObserver;
const cloudinaryOriginal = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/[^\s,?#]+)$/;
const responsiveWidths = [160, 320, 480, 720, 960, 1440];

function cloudinarySrcSet(src) {
  if (!cloudinaryOriginal.test(src)) return undefined;
  return responsiveWidths.map(width => {
    const url = src.replace(cloudinaryOriginal, `$1c_scale,w_${width},f_webp,q_75/$2`);
    return `${url} ${width}w`;
  }).join(', ');
}

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

function ImageAsset({ src, alt, className = '', eager = false, loadingLabel, sizes, srcSet, fetchPriority, width, height }) {
  const [status, setStatus] = useState('loading');
  const [useOriginal, setUseOriginal] = useState(false);
  if (!src || status === 'error') return <div role="img" aria-label={`${alt}: imagen no disponible`} className={`product-image-placeholder ${className}`}><Gem size={30} strokeWidth={1} /><span>Imagen por actualizar</span></div>;

  const showLoading = Boolean(loadingLabel) && status === 'loading';
  const candidates = useOriginal ? undefined : srcSet ?? (sizes && cloudinarySrcSet(src));
  return <>
    <img
      key={useOriginal ? 'original' : 'preferred'}
      ref={showLoading ? observeLoadingImage : undefined}
      sizes={candidates ? sizes : undefined}
      srcSet={candidates}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`product-photo ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={fetchPriority}
      decoding="async"
      data-photo-loading={showLoading ? '' : undefined}
      onLoad={showLoading ? () => setStatus('loaded') : undefined}
      onError={({ currentTarget }) => {
        if (candidates && currentTarget.currentSrc !== currentTarget.src) setUseOriginal(true);
        else setStatus('error');
      }}
    />
    {showLoading && <span className="product-image-loading-label" aria-hidden="true">{loadingLabel}</span>}
  </>;
}
export default function ProductImage(props) {
  return <ImageAsset key={props.src} {...props} />;
}
