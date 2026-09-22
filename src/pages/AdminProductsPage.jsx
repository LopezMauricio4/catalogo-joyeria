import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Eye, EyeOff, Trash2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { categories, materialLabels } from '../data/mockProducts';
import { fetchAdminProducts } from '../services/productApi';
import { formatPrice, normalizeText } from '../utils/catalog';
import ProductImage from '../components/ProductImage';
import Modal from '../components/Modal';
import ProductEditor from './ProductEditor';

export default function AdminProductsPage({ onSaveProduct, onDeleteProduct, onVisibilityChange, loadProducts = fetchAdminProducts }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('home');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const actionLock = useRef(false);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    loadProducts(controller.signal).then(items => { if (active) setProducts(items); }).catch(error => {
      if (active) setLoadError(controller.signal.aborted ? 'La carga tardó demasiado. Intenta actualizar.' : error.message);
    }).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [revision, loadProducts]);
  const filtered = useMemo(() => products.filter(product =>
    (filter === 'all' || product.visible === (filter === 'visible')) &&
    (!material || product.material === material) && (!category || product.category === category) &&
    normalizeText(`${product.name} ${product.description}`).includes(normalizeText(search))
  ), [products, filter, material, category, search]);
  const replaceProduct = saved => setProducts(items => items.some(item => item.id === saved.id)
    ? items.map(item => item.id === saved.id ? saved : item) : [saved, ...items]);
  const browse = selected => { setFilter(selected); setView('products'); };
  const edit = product => { setEditing(product); setView('editor'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const mutate = async operation => {
    if (actionLock.current) return;
    actionLock.current = true; setBusy(true);
    try { await operation(); }
    catch (error) { showToast(error.message || 'No se pudo guardar el cambio.', 'error'); }
    finally { actionLock.current = false; setBusy(false); }
  };
  const toggleVisibility = product => mutate(async () => {
    replaceProduct(await onVisibilityChange(product.id, !product.visible));
    showToast(product.visible ? 'Producto oculto del catálogo' : 'Producto visible en el catálogo', 'success');
  });
  const remove = () => mutate(async () => {
    await onDeleteProduct(pendingDelete.id);
    setProducts(items => items.filter(item => item.id !== pendingDelete.id));
    setPendingDelete(null);
    showToast('Producto eliminado', 'success');
  });
  if (view === 'editor') return <ProductEditor key={editing?.id || 'new'} product={editing}
    onSaveProduct={async (payload, id) => {
      replaceProduct(await onSaveProduct(payload, id));
      setFilter('all'); setSearch(''); setMaterial(''); setCategory('');
    }} onCancel={() => setView('products')} />;
  return <section className="admin-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="admin-toolbar mb-8"><div><p className="luxury-eyebrow">Administrador</p><h1 className="mt-3 text-5xl">Tu catálogo</h1></div><Link to="/catalogo">Ver catálogo público →</Link></div>
    <nav className="admin-options" aria-label="Administrar productos">
      <button onClick={() => edit(null)} disabled={busy || loading}><Plus /><strong>Agregar producto</strong><span>Crea una nueva pieza</span></button>
      <button aria-current={view === 'products' && filter !== 'hidden' ? 'page' : undefined} disabled={busy} onClick={() => browse('all')}><Pencil /><strong>Administrar productos</strong><span>Edita, oculta o elimina</span></button>
      <button aria-current={view === 'products' && filter === 'hidden' ? 'page' : undefined} disabled={busy} onClick={() => browse('hidden')}><EyeOff /><strong>Productos ocultos</strong><span>Revísalos y vuelve a mostrarlos</span></button>
    </nav>
    {view === 'home' && <p className="mt-6 text-ink-muted">Selecciona una opción para comenzar.</p>}
    {view === 'products' && <section className="mt-8" aria-label="Lista de productos">
      <div className="admin-toolbar"><h2 className="text-3xl">{filter === 'hidden' ? 'Productos ocultos' : 'Administrar productos'}</h2><button className="shop-button" disabled={loading || busy} onClick={() => { setLoading(true); setLoadError(''); setRevision(n => n + 1); }}><RefreshCw size={16} />Actualizar lista</button></div>
      <div className="admin-filters">
        <label>Buscar producto<div className="admin-search"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre o descripción…" /></div></label>
        <label>Visibilidad<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todos los productos</option><option value="visible">Visibles</option><option value="hidden">Ocultos</option></select></label>
        <label>Material<select value={material} onChange={event => setMaterial(event.target.value)}><option value="">Todos los materiales</option>{Object.entries(materialLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Categoría<select value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas las categorías</option>{categories.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
      </div>
      {loadError ? <p role="alert" className="my-6 text-red-700">{loadError} Usa “Actualizar lista” para reintentar.</p> : loading ? <p role="status" className="my-6">Cargando productos…</p> : <>
        <p role="status" className="my-5 text-sm text-ink-muted">{filtered.length} productos</p>
        <div className="admin-product-grid">{filtered.map(product => <article key={product.id} className="admin-product-card">
          <button className="admin-product-photo" disabled={busy} onClick={() => edit(product)} aria-label={`Editar ${product.name}`}><ProductImage src={product.image} alt={product.name} /></button>
          <div className="admin-product-info"><span className={`admin-status ${product.visible ? '' : 'is-hidden'}`}>{product.visible ? <Eye size={13} /> : <EyeOff size={13} />}{product.visible ? 'Visible' : 'Oculto'}</span>
            <p className="mt-3 text-xs text-ink-muted">{materialLabels[product.material]}</p><h3 className="mt-1 text-2xl">{product.name}</h3><p className="mt-2 font-semibold">{formatPrice(product.price)} <small>COP</small></p><p className="mt-1 text-sm text-ink-muted">Stock: {product.stock ?? 'Sin definir'}{product.featured ? ' · Destacado' : ''}</p>
            <div className="admin-card-actions"><button disabled={busy} onClick={() => edit(product)}><Pencil size={16} />Editar</button><button disabled={busy} onClick={() => toggleVisibility(product)}>{product.visible ? <EyeOff size={16} /> : <Eye size={16} />}{product.visible ? 'Ocultar' : 'Mostrar'}</button><button disabled={busy} className="admin-delete" onClick={() => setPendingDelete(product)}><Trash2 size={16} />Eliminar</button></div>
          </div>
        </article>)}</div>
        {!filtered.length && <p className="py-10 text-center">No hay productos en esta selección. Prueba otros filtros o agrega una pieza.</p>}
      </>}
    </section>}
    <Modal open={Boolean(pendingDelete)} onClose={() => { if (!busy) setPendingDelete(null); }} title="¿Eliminar este producto?">
      <p>“{pendingDelete?.name}” se eliminará definitivamente. Si quieres retirarlo temporalmente, usa Ocultar.</p>
      <div className="mt-6 flex flex-wrap gap-3"><button className="shop-button" disabled={busy} onClick={() => setPendingDelete(null)}>Cancelar</button><button className="shop-button admin-delete" disabled={busy} onClick={remove}>{busy ? 'Eliminando…' : 'Eliminar definitivamente'}</button></div>
    </Modal>
  </section>;
}
