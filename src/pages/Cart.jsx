import { WhatsAppIcon } from '../components/SocialIcon';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import Modal from '../components/Modal';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { cartSubtotal, resolveCart } from '../utils/cart';
import { formatPrice, materialNames } from '../utils/catalog';
import { buildWhatsAppLink, generateCartMessage } from '../utils/whatsappGenerator';

export default function Cart({ cart, products, isLoading, error, refreshProducts }) {
  useDocumentMeta({ title: 'Tu carrito', description: 'Reúne tus joyas favoritas y coordina tu pedido por WhatsApp.' });
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const rows = resolveCart(cart.items, products);
  const signature = JSON.stringify({ items: cart.items, products });
  const valid = rows.length > 0 && rows.every(row => !row.issue) && !isLoading && !error;
  const verified = ready === signature && valid;
  const verify = async () => {
    setChecking(true); setNotice(''); setReady('');
    try {
      const fresh = await refreshProducts();
      const checked = resolveCart(cart.items, fresh);
      if (checked.some(row => row.issue)) setNotice('La disponibilidad cambió. Revisa las piezas señaladas antes de continuar.');
      else {
        setReady(JSON.stringify({ items: cart.items, products: fresh }));
        setNotice('Precios y disponibilidad actualizados. Revisa el subtotal y abre WhatsApp para coordinar tu pedido.');
      }
    } catch { setNotice('No pudimos verificar las piezas. Comprueba tu conexión e inténtalo de nuevo.'); }
    finally { setChecking(false); }
  };
  return <div className="cart-page shop-shell">
    <Link to="/catalogo" className="product-back"><ArrowLeft size={17} />Seguir descubriendo</Link>
    <header className="cart-heading"><p className="shop-eyebrow">TU SELECCIÓN PERSONAL</p><h1>Tu carrito</h1><p>Las joyas que te gustan, juntas en un solo pedido.</p></header>
    {!cart.items.length ? <section className="catalog-empty"><ShoppingBag size={34} strokeWidth={1} /><h2>Tu próxima joya te espera</h2><p>Agrega tus piezas favoritas y coordina la compra por WhatsApp, sin crear una cuenta.</p><Link to="/catalogo" className="shop-button">Explorar las piezas</Link></section>
      : isLoading ? <p role="status">Cargando tus piezas…</p>
        : error ? <p role="alert">No podemos mostrar las piezas en este momento. Usa «Reintentar» arriba. Tu selección está guardada.</p>
          : <div className="cart-layout"><section aria-label="Piezas del carrito" className="cart-items">
            {rows.map(({ id, quantity, product, limit, issue }) => <article key={id} className="cart-item">
              {product ? <Link to={`/producto/${encodeURIComponent(id)}`} className="cart-photo"><ProductImage src={product.image} alt={product.name} /></Link> : <div className="cart-photo"><ProductImage alt="Pieza no disponible" /></div>}
              <div className="cart-item-info"><p className="shop-eyebrow">{product ? materialNames[product.material] || product.material : 'No disponible'}</p><h2>{product ? <Link to={`/producto/${encodeURIComponent(id)}`}>{product.name}</Link> : 'Pieza retirada del catálogo'}</h2>
                {product && <p>{formatPrice(product.price)} <small>{product.price > 0 ? 'COP / unidad' : ''}</small></p>}
                {issue && <p className="shop-form-error" role="alert">{issue}</p>}
                <div className="cart-item-actions"><div className="cart-quantity" role="group" aria-label={`Cantidad de ${product?.name || 'pieza'}`}>
                  <button type="button" disabled={checking || quantity <= 1 || limit === 0} aria-label={`Reducir cantidad de ${product?.name || 'pieza'}`} onClick={() => cart.setQuantity(id, Math.min(quantity - 1, limit))}><Minus size={16} /></button><span aria-live="polite">{quantity}</span>
                  <button type="button" disabled={checking || quantity >= limit} aria-label={`Aumentar cantidad de ${product?.name || 'pieza'}`} onClick={() => cart.setQuantity(id, quantity + 1)}><Plus size={16} /></button>
                </div><button type="button" className="cart-remove" disabled={checking} onClick={() => cart.remove(id)} aria-label={`Quitar ${product?.name || 'pieza'} del carrito`}><Trash2 size={16} />Quitar</button></div>
                {product?.price > 0 && <p className="cart-line-total">{formatPrice(product.price * quantity)} COP</p>}
              </div>
            </article>)}
            <button type="button" className="shop-text-link" disabled={checking} onClick={() => setConfirmClear(true)}>Vaciar carrito</button>
          </section><aside className="cart-summary"><h2>Tu pedido</h2><p>{cart.count} {cart.count === 1 ? 'joya seleccionada' : 'joyas seleccionadas'}</p><div className="cart-subtotal"><span>Subtotal estimado</span><strong>{cartSubtotal(rows) > 0 ? formatPrice(cartSubtotal(rows)) : 'Por confirmar'}</strong></div>
            {rows.some(row => row.product && !(row.product.price > 0)) && <p>Hay piezas con precio por confirmar que no se incluyen en el subtotal.</p>}
            <p>Confirmamos disponibilidad, pago y envío contigo por WhatsApp. Agregar piezas no las reserva.</p>
            {verified ? <a className="shop-button" href={buildWhatsAppLink(generateCartMessage(rows, window.location.origin))} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19} />Abrir WhatsApp con mi pedido</a>
              : <button className="shop-button" type="button" disabled={checking} onClick={verify}><WhatsAppIcon size={19} />{checking ? 'Verificando piezas…' : 'Continuar por WhatsApp'}</button>}
            {notice && <p role="status" className="cart-notice">{notice}</p>}
            <p className="cart-note">Tu carrito se conserva en este navegador. El pedido se envía cuando lo confirmas en WhatsApp.</p>
          </aside></div>}
    <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="¿Vaciar tu carrito?"><p>Se quitarán todas las piezas de tu selección.</p><div className="product-purchase-actions"><button className="shop-button shop-button-light" onClick={() => setConfirmClear(false)}>Conservar piezas</button><button className="shop-button" onClick={() => { cart.clear(); setConfirmClear(false); }}>Vaciar carrito</button></div></Modal>
  </div>;
}
