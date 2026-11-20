import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Eye, EyeOff, Trash2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { categories, materialLabels } from '../data/mockProducts';
import { fetchAdminProducts } from '../services/productApi';
import { formatPrice, normalizeText } from '../utils/catalog';
import { plural } from '../utils/adminFormat';
import ProductImage from '../components/ProductImage';
import BottomSheet from '../components/BottomSheet';
import AdminFilters from '../components/AdminFilters';
import ProductEditor from './ProductEditor';
import AdminNavigation from '../components/AdminNavigation';

export default function AdminProductsPage({ onSaveProduct, onDeleteProduct, onVisibilityChange, loadProducts = fetchAdminProducts }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('products');
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
  const listScroll = useRef(0);
  const previousView = useRef(view);
  useLayoutEffect(() => {
    if (view === 'editor') window.scrollTo({ top: 0, behavior: 'instant' });
    else if (previousView.current === 'editor') window.scrollTo({ top: listScroll.current, behavior: 'instant' });
    previousView.current = view;
  }, [view]);
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
  const edit = product => { listScroll.current = window.scrollY; setEditing(product); setView('editor'); };
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
    }} onCancel={() => setView('products')} />;
  const hiddenCount = products.filter(product => !product.visible).length;
  const reload = () => { setLoading(true); setLoadError(''); setRevision(n => n + 1); };
  return <section className="admin-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <AdminNavigation />
    <div className="admin-toolbar admin-page-heading">
      <div><h1>Productos</h1><p>Piezas del catálogo público: precio, visibilidad y fotos.</p></div>
      <div className="admin-heading-actions"><Link className="admin-text-link" to="/catalogo">Ver catálogo público</Link><button type="button" className="luxury-btn luxury-btn-primary" onClick={() => edit(null)} disabled={busy || loading}><Plus size={18} aria-hidden="true" />Agregar producto</button></div>
    </div>
    <section aria-label="Lista de productos">
      <AdminFilters className="admin-product-filters">
        <label className="admin-product-search">Buscar<div className="admin-search"><Search size={15} aria-hidden="true" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre o descripción…" /></div></label>
        <label>Visibilidad<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todos</option><option value="visible">Visibles</option><option value="hidden">Ocultos</option></select></label>
        <label>Material<select value={material} onChange={event => setMaterial(event.target.value)}><option value="">Todos</option>{Object.entries(materialLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Categoría<select value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas</option>{categories.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
      </AdminFilters>
      <div className="admin-list-status">
        <p role="status">{loading ? 'Cargando productos…' : loadError ? 'Lista no disponible' : `${plural(filtered.length, 'producto', 'productos')}${filtered.length !== products.length ? ` de ${products.length}` : ''}`}</p>
        {!loading && !loadError && hiddenCount > 0 && filter !== 'hidden' && <button type="button" className="admin-text-link" onClick={() => setFilter('hidden')}>{plural(hiddenCount, 'oculto', 'ocultos')} · Revisar</button>}
        <button type="button" className="admin-icon-button" aria-label="Actualizar lista de productos" title="Actualizar lista" disabled={loading || busy} onClick={reload}><RefreshCw size={18} aria-hidden="true" /></button>
      </div>
      {loadError ? <div role="alert" className="admin-block-error"><p>No se pudo cargar la lista de productos. {loadError}</p><button type="button" className="shop-button shop-button-secondary" onClick={reload}>Reintentar</button></div>
        : loading ? <div className="admin-product-list" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="admin-product-row is-placeholder" />)}</div>
        : filtered.length ? <ul className="admin-product-list">{filtered.map(product => <li key={product.id} className="admin-product-row">
          <button type="button" className="admin-product-identity" disabled={busy} onClick={() => edit(product)} aria-label={`Editar ${product.name}`}>
            <span className="admin-product-thumb"><ProductImage src={product.image} alt="" /></span>
            <span className="admin-product-text"><strong>{product.name}</strong><span>{materialLabels[product.material] || product.material} · {categories.find(item => item.key === product.category)?.label || product.category}</span></span>
          </button>
          <p className="admin-product-price">{formatPrice(product.price)}</p>
          <p className="admin-product-flags"><span className={`admin-status ${product.visible ? '' : 'is-hidden'}`}>{product.visible ? 'Visible' : 'Oculto'}</span>{product.featured && <span className="admin-status is-featured">Destacado</span>}</p>
          <div className="admin-product-actions">
            <button type="button" className="admin-row-button" disabled={busy} onClick={() => edit(product)}><Pencil size={16} aria-hidden="true" />Editar</button>
            <button type="button" className="admin-row-button" disabled={busy} onClick={() => toggleVisibility(product)} aria-label={`${product.visible ? 'Ocultar' : 'Mostrar'} ${product.name}`}>{product.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}{product.visible ? 'Ocultar' : 'Mostrar'}</button>
            <button type="button" className="admin-icon-button admin-delete" disabled={busy} onClick={() => setPendingDelete(product)} aria-label={`Eliminar ${product.name}`} title="Eliminar"><Trash2 size={18} aria-hidden="true" /></button>
          </div>
        </li>)}</ul>
        : <div className="admin-block-empty"><p>{products.length ? 'Ningún producto coincide con estos filtros.' : 'Todavía no hay productos.'}</p>{products.length ? <button type="button" className="admin-text-link" onClick={() => { setFilter('all'); setSearch(''); setMaterial(''); setCategory(''); }}>Quitar filtros</button> : <button type="button" className="admin-text-link" onClick={() => edit(null)}>Agregar el primero</button>}</div>}
    </section>
    <BottomSheet className="admin-bottom-sheet" closeLabel="Cerrar confirmación" dismissible={!busy} open={Boolean(pendingDelete)} onClose={() => { if (!busy) setPendingDelete(null); }} title="¿Eliminar este producto?">
      <p>“{pendingDelete?.name}” se eliminará definitivamente. Si quieres retirarlo temporalmente, usa Ocultar.</p>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" className="shop-button shop-button-secondary" disabled={busy} onClick={() => setPendingDelete(null)}>Cancelar</button><button className="shop-button admin-delete" disabled={busy} onClick={remove}>{busy ? 'Eliminando…' : 'Eliminar definitivamente'}</button></div>
    </BottomSheet>
  </section>;
}
