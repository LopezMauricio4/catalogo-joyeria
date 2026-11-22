import { Link, useLocation } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatPrice, materialNames } from '../utils/catalog';

export default function JewelryCard({ product, eager = false, sizes = '(max-width: 767px) 48vw, (max-width: 1023px) 32vw, (max-width: 1439px) 24vw, 340px' }) {
  const location = useLocation();
  if (!product) return null;

  const catalogReturn = location.pathname === '/catalogo' ? `${location.pathname}${location.search}` : location.state?.catalogReturn || '/catalogo';
  return <article className="jewel-card" data-material={product.material}>
    <Link className="jewel-card-link" to={`/producto/${encodeURIComponent(product.id)}`} state={{ catalogReturn }}>
      <div className="jewel-card-photo" aria-hidden="true"><ProductImage src={product.image} alt={product.name} eager={eager} sizes={sizes} loadingLabel="Tejiendo…" /></div>
      <div className="jewel-card-info"><h3>{product.name}</h3><p className="jewel-card-material">{materialNames[product.material] || product.material}</p><p className="jewel-card-price">{formatPrice(product.price)}{product.price > 0 && <span> COP</span>}</p></div>
    </Link>
  </article>;
}
