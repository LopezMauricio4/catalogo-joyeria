import { WhatsAppIcon } from '../components/SocialIcon';
import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ShoppingCart, ZoomIn } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import JewelryCard from '../components/JewelryCard';
import ProductImage from '../components/ProductImage';
import Modal from '../components/Modal';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { formatPrice, isSoldOut, materialNames } from '../utils/catalog';
import { buildWhatsAppLink, generateProductMessage } from '../utils/whatsappGenerator';
import { stockLimit } from '../utils/cart';

function ProductView({ product, catalogReturn, cart, relatedProducts = [] }) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
  const index = Math.min(selected, Math.max(0, images.length - 1));
  const soldOut = isSoldOut(product);
  const whatsappLink = buildWhatsAppLink(generateProductMessage(product, window.location.origin));
  const move = direction => setSelected(current => (current + direction + images.length) % images.length);
  const label = soldOut ? 'Consultar alternativas' : 'Pedir';
  const quantityInCart = cart.items.find(item => item.id === String(product.id))?.quantity || 0;
  const atLimit = quantityInCart >= stockLimit(product);
  const purchaseActions = <div className="product-purchase-actions"><a className="shop-button" href={whatsappLink} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19} />{label}</a>{!soldOut && <button type="button" className="shop-button shop-button-secondary" disabled={atLimit} onClick={() => cart.add(product)}><ShoppingCart size={19} />{atLimit ? 'Ya en tu carrito' : 'Agregar al carrito'}</button>}</div>;
  return <div className="product-page shop-shell">
    <Link className="product-back" to={catalogReturn}><ArrowLeft size={17} />Volver a las piezas</Link>
    <section className="product-layout" aria-label={product.name}>
      <div className={`product-gallery${images.length > 1 ? ' has-thumbnails' : ''}`}>
        <div className="product-main-photo" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => {
          if (!touch.current || images.length < 2) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
          touch.current = null;
        }}>
          <button type="button" className="product-zoom-trigger" onClick={() => setZoom(true)} aria-label={`Ampliar imagen de ${product.name}`}><ProductImage src={images[index]} alt={product.name} eager /><span className="product-zoom-hint" aria-hidden="true"><ZoomIn size={20} /></span></button>
          {soldOut && <span className="product-stock-badge">Agotada por ahora</span>}
        </div>
        {images.length > 1 && <div className="product-gallery-thumbnails" role="group" aria-label="Imágenes de la pieza">{images.map((image, position) => <button key={image} type="button" aria-label={`Ver imagen ${position + 1} de ${images.length}`} aria-pressed={index === position} onClick={() => setSelected(position)}><ProductImage src={image} alt={`${product.name}, vista ${position + 1}`} /></button>)}</div>}
        <span className="sr-only" aria-live="polite">Imagen {index + 1} de {images.length || 1}</span>
      </div>
      <div className="product-story"><p className="shop-eyebrow">{materialNames[product.material] || product.material}</p><h1>{product.name}</h1><div className="product-price-row"><p className="product-price">{formatPrice(product.price)}{product.price > 0 && <span> COP</span>}</p><span className={`product-availability ${soldOut ? 'is-sold-out' : ''}`}><i />{soldOut ? 'Agotada' : Number(product.stock) > 0 ? 'Disponible' : 'Consultar disponibilidad'}</span></div>
        <p className="product-description">{product.description || 'Conoce todos los detalles de esta pieza con nuestra asesoría personalizada.'}</p>
        <div className="product-purchase">{purchaseActions}{quantityInCart > 0 && <Link to="/carrito" className="product-cart-feedback">{quantityInCart} en tu carrito · Ver pedido <ArrowRight size={15} /></Link>}<p>{soldOut ? 'Pregúntanos por su regreso o por una pieza similar.' : 'Pide esta joya por WhatsApp o reúne varias en tu carrito.'}</p><span>No necesitas crear una cuenta.</span></div>
        <details className="product-details" open><summary>Detalles que la hacen especial</summary><ul>{(product.features?.length ? product.features : [materialNames[product.material] || product.material]).map((feature, position) => <li key={`${feature}-${position}`}><Check size={16} /><span>{feature}</span></li>)}</ul></details>
        <details className="product-details"><summary>¿Cómo comprar tu joya?</summary><ol><li>Elige «Pedir» para consultar esta pieza o agrega varias al carrito y continúa por WhatsApp.</li><li>Confirmamos contigo disponibilidad, medidas y opciones de entrega.</li><li>Acordamos los detalles de pago y envío directamente contigo.</li></ol></details>
        <p className="product-reference">Referencia: {product.id}</p>
      </div>
    </section>
    {relatedProducts.length > 0 && (
      <section className="product-related" aria-label="También te puede interesar">
        <div className="product-related-heading">
          <div>
            <p className="shop-eyebrow">PARA TI</p>
            <h2>También te puede interesar</h2>
          </div>
          <Link to="/catalogo" className="shop-text-link">Ver todo</Link>
        </div>
        <div className="shop-product-grid">
          {relatedProducts.map(related => <JewelryCard key={related.id} product={related} />)}
        </div>
      </section>
    )}
    <Modal open={zoom} onClose={() => setZoom(false)} title={product.name} className="product-zoom-dialog"><ProductImage src={images[index]} alt={`${product.name}, imagen ampliada`} eager />{images.length > 1 && <div className="product-zoom-navigation"><button type="button" className="shop-icon-button" onClick={() => move(-1)} aria-label="Imagen ampliada anterior"><ChevronLeft /></button><span aria-live="polite">{index + 1} / {images.length}</span><button type="button" className="shop-icon-button" onClick={() => move(1)} aria-label="Imagen ampliada siguiente"><ChevronRight /></button></div>}</Modal>
  </div>;
}

export default function ProductDetail({ products, error = '', cart }) {
  const { id } = useParams();
  const location = useLocation();
  const product = products.find(item => String(item.id) === id);
  const candidate = location.state?.catalogReturn;
  const catalogReturn = typeof candidate === 'string' && (candidate === '/catalogo' || candidate.startsWith('/catalogo?')) ? candidate : '/catalogo';
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(item => item.id !== product.id && (item.category === product.category || item.material === product.material))
      .slice(0, 4);
  }, [product, products]);
  useDocumentMeta({ title: product?.name, description: product?.description, image: product?.image });
  if (!product) return <div className="shop-shell catalog-empty"><p className="shop-eyebrow">{error ? 'INTENTA DE NUEVO' : 'SIGUE EXPLORANDO'}</p><h1>{error ? 'No pudimos cargar esta pieza' : 'Esta pieza ya no está en el catálogo'}</h1><p>{error ? 'Usa el botón de reintentar para volver a cargar el catálogo.' : 'Descubre otras joyas o escríbenos para encontrar una alternativa.'}</p><Link to={catalogReturn} className="shop-button"><ArrowLeft size={17} />Volver al catálogo</Link></div>;
  return <ProductView key={product.id} product={product} catalogReturn={catalogReturn} cart={cart} relatedProducts={relatedProducts} />;
}
