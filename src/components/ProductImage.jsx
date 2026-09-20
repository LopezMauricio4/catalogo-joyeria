import { useState } from 'react';
import { Gem } from 'lucide-react';

function ImageAsset({ src, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div role="img" aria-label={`${alt}: imagen no disponible`} className={`product-image-placeholder ${className}`}><Gem size={30} strokeWidth={1} /><span>Imagen por actualizar</span></div>;
  return <img src={src} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}
export default function ProductImage(props) {
  return <ImageAsset key={props.src} {...props} />;
}
