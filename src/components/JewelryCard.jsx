import { ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatPrice, isSoldOut, materialNames } from '../utils/catalog';

export default function JewelryCard({ product, eager = false }) {
  const location = useLocation();
  if (!product) return null;
  const soldOut = isSoldOut(product);
  const catalogReturn = location.pathname === '/catalogo' ? `${location.pathname}${location.search}` : location.state?.catalogReturn || '/catalogo';
  return <article className="jewel-card">
    <Link className="jewel-card-link" to={`/producto/${encodeURIComponent(product.id)}`} state={{ catalogReturn }} aria-label={`Ver ${product.name}`}>
      <div className="jewel-card-photo"><ProductImage src={product.image} alt={product.name} eager={eager} />{soldOut && <span className="jewel-card-badge is-sold-out">Agotada</span>}</div>
      <div className="jewel-card-info"><p className="jewel-card-material">{materialNames[product.material] || product.material}</p><h3>{product.name}</h3><p className="jewel-card-price">{formatPrice(product.price)}{product.price > 0 && <span> COP</span>}</p><span className="jewel-card-action">{soldOut ? 'Consultar alternativas' : 'Descubrir pieza'}<ArrowUpRight size={14} /></span></div>
    </Link>
  </article>;
}
