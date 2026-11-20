import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { addInventoryMovement, createInventoryItem, fetchInventory, updateInventoryItem } from '../services/inventoryApi';
import ProductImage from '../components/ProductImage';
import InventoryCard from '../components/InventoryCard';
import InventoryMovementForm from '../components/InventoryMovementForm';
import AdminFormSections from '../components/AdminFormSections';
import AdminFilters from '../components/AdminFilters';
import AdminNavigation from '../components/AdminNavigation';
import { inventoryName } from '../utils/inventoryName';
import { normalizeText } from '../utils/catalog';
import { plural } from '../utils/adminFormat';

const needsReview = item => item.active !== false && Number(item.stock) <= Number(item.minStock);

const categories = ['balines', 'herrajes', 'pasantes', 'cadenas', 'pulseras', 'dijes', 'candongas', 'topos', 'otros'];
const materials = ['oro', 'oro laminado'];
const materialLabels = { oro: 'Oro', 'oro laminado': 'Oro laminado' };
const emptyForm = { name: '', category: 'balines', material: 'oro laminado', size: '', lengthCm: '', thicknessMm: '', weightGrams: '', unit: 'unidad', stock: '0', unitCost: '0', salePrice: '0' };

function ItemForm({ item, onSaved, onCancel, onMovement }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(item ? { ...emptyForm, ...item } : emptyForm);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const isBalin = form.category === 'balines' && form.material === 'oro laminado';
  const isTopo = form.category === 'topos' && form.material === 'oro laminado';
  const isLong = ['cadenas', 'pulseras'].includes(form.category);
  const update = event => {
    const { name, value } = event.target;
    setForm(current => {
      const next = { ...current, [name]: value };
      if (name === 'category' || name === 'material') {
        if (next.category !== current.category) { next.size = ''; next.lengthCm = ''; next.thicknessMm = ''; }
        if (next.material !== current.material) { next.size = ''; next.weightGrams = ''; }
      }
      return next;
    });
  };
  const submit = async event => {
    event.preventDefault(); setBusy(true);
    try {
      const data = new FormData();
      ['name', 'category', 'material', 'size', 'lengthCm', 'thicknessMm', 'weightGrams', 'unit', ...(!item ? ['stock'] : []), 'unitCost', 'salePrice'].forEach(key => data.append(key, form[key] ?? ''));
      if (file) data.append('imagenes', file);
      const saved = item ? await updateInventoryItem(item.id, data) : await createInventoryItem(data);
      showToast(item ? 'Artículo actualizado' : 'Artículo creado', 'success'); onSaved(saved);
    } catch (error) { showToast(error.message, 'error'); } finally { setBusy(false); }
  };
  return <form className="inventory-form admin-form-compact" onSubmit={submit}>
    <div className="inventory-form-header"><div><h2>{item ? item.name : 'Agregar insumo'}</h2></div></div>
    <AdminFormSections labels={["Datos y variantes", "Existencias y precios", "Multimedia"]}>
    <div className="inventory-form-section"><div className="inventory-fields inventory-fields-three">
      <label className="inventory-field"><span>Nombre <b>*</b></span><input required name="name" value={form.name} onChange={update} placeholder="Balín" /></label>
      <label className="inventory-field"><span>Categoría</span><select name="category" value={form.category} onChange={update}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="inventory-field"><span>Material</span><select name="material" value={form.material} onChange={update}>{materials.map(value => <option key={value} value={value}>{materialLabels[value]}</option>)}</select></label>
            {isBalin ? <label className="inventory-field"><span>Tamaño (mm) *</span><select required name="size" value={String(form.size ?? '').replace(/^#\s*/, '').replace(/\s*mm$/i, '')} onChange={update}><option value="">Seleccionar</option>{[3, 4, 5, 6, 7, 8].map(size => <option key={size} value={size}>{size} mm</option>)}</select></label>
        : isTopo ? <label className="inventory-field"><span>Tamaño *</span><select required name="size" value={String(form.size ?? '').toLowerCase()} onChange={update}><option value="">Seleccionar</option>{['pequeño', 'mediano', 'grande'].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
        : !isLong && <label className="inventory-field"><span>Tamaño o referencia</span><input name="size" value={form.size ?? ''} onChange={update} /></label>}
      {isLong && <><label className="inventory-field"><span>Longitud (cm)</span><input type="number" min="0.001" step="0.001" name="lengthCm" value={form.lengthCm ?? ''} onChange={update} /></label><label className="inventory-field"><span>Grosor (mm)</span><input type="number" min="0.001" step="0.001" name="thicknessMm" value={form.thicknessMm ?? ''} onChange={update} /></label></>}
      {form.material === 'oro' && <label className="inventory-field"><span>Peso (g, opcional)</span><input type="number" min="0.001" step="0.001" name="weightGrams" value={form.weightGrams ?? ''} onChange={update} /></label>}
    </div></div>
    <div className="inventory-form-section"><div className="inventory-fields inventory-fields-three">
      <label className="inventory-field"><span>{item ? 'Stock actual' : 'Stock inicial'}</span><input disabled={Boolean(item)} type="number" min="0" step="0.001" name="stock" value={item ? item.stock : form.stock} onChange={update} /></label>
      <label className="inventory-field"><span>Costo unitario <small>COP</small></span><input type="number" min="0" step="0.01" name="unitCost" value={form.unitCost} onChange={update} /></label>
      <label className="inventory-field"><span>Precio de venta <small>COP</small></span><input type="number" min="0" step="0.01" name="salePrice" value={form.salePrice} onChange={update} /></label>
    </div></div>
    <div className="inventory-form-section"><label className="inventory-field"><span>Fotografía</span><input className="inventory-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={event => setFile(event.target.files?.[0] || null)} /></label>{item?.image && !file && <ProductImage src={item.image} alt={item.name} className="inventory-current-image" />}</div>
    </AdminFormSections>
    <div className="inventory-form-actions">{item && <><button type="button" className="shop-button" disabled={busy} onClick={() => onMovement(item, 'PURCHASE')}>Agregar existencias</button><button type="button" className="shop-button" disabled={busy} onClick={() => onMovement(item, 'CONSUMPTION')}>Retirar existencias</button></>}<button className="luxury-btn luxury-btn-primary" disabled={busy}>{busy ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear artículo'}</button><button type="button" className="shop-button" disabled={busy} onClick={onCancel}>Cancelar</button></div>
  </form>;
}

export default function InventoryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(undefined);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [revision, setRevision] = useState(0);
  const [movement, setMovement] = useState({ item: null, type: 'PURCHASE', quantity: '', note: '' });
  const controllerRef = useRef(null);
  useEffect(() => { controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller; fetchInventory(controller.signal).then(data => { if (!controller.signal.aborted) { setItems(data); setLoadError(''); } }).catch(error => { if (error.name !== 'AbortError' && !controller.signal.aborted) setLoadError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [revision]);
  const filtered = useMemo(() => items.filter(item => (!reviewOnly || needsReview(item)) && (!category || item.category === category) && (!material || item.material === material) && normalizeText(inventoryName(item)).includes(normalizeText(search))), [items, search, category, material, reviewOnly]);
  const reviewCount = items.filter(needsReview).length;
  const saved = item => { setItems(current => current.some(value => value.id === item.id) ? current.map(value => value.id === item.id ? item : value) : [item, ...current]); setEditing(undefined); };
  const openMovement = (item, type) => setMovement({ item, type, quantity: '', note: '' });
  const submitMovement = async data => { const item = await addInventoryMovement(movement.item.id, data); setItems(current => current.map(value => value.id === item.id ? item : value)); setEditing(current => current?.id === item.id ? item : current); setMovement({ item: null }); showToast('Existencias actualizadas', 'success'); };
  return <section className="admin-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <AdminNavigation />
    <div className="admin-toolbar admin-page-heading"><div><h1>Inventario</h1><p>Insumos, variantes, costos y movimientos de stock.</p></div>{editing === undefined && <div className="admin-heading-actions"><button type="button" className="luxury-btn luxury-btn-primary" onClick={() => setEditing(null)}><Plus size={18} aria-hidden="true" />Agregar artículo</button></div>}</div>
    {editing !== undefined ? <ItemForm item={editing} onMovement={openMovement} onSaved={saved} onCancel={() => setEditing(undefined)} /> : <>
      <AdminFilters className="inventory-filters"><label>Buscar<input type="search" className="admin-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre…" /></label><label>Categoría<select value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label>Material<select value={material} onChange={event => setMaterial(event.target.value)}><option value="">Todos</option>{materials.map(value => <option key={value} value={value}>{materialLabels[value]}</option>)}</select></label></AdminFilters>
      <div className="admin-list-status">
        <p role="status">{loading ? 'Cargando inventario…' : loadError ? 'Inventario no disponible' : `${plural(filtered.length, 'artículo', 'artículos')}${filtered.length !== items.length ? ` de ${items.length}` : ''}`}</p>
        {!loading && !loadError && (reviewCount > 0 || reviewOnly) && <button type="button" className={`admin-review-toggle${reviewOnly ? ' is-active' : ''}`} aria-pressed={reviewOnly} onClick={() => setReviewOnly(value => !value)}>{reviewOnly ? 'Ver todos' : `${plural(reviewCount, 'con stock bajo o agotado', 'con stock bajo o agotados')}`}</button>}
        <button type="button" className="admin-icon-button" aria-label="Actualizar inventario" title="Actualizar inventario" disabled={loading} onClick={() => { setLoading(true); setRevision(value => value + 1); }}><RefreshCw size={18} aria-hidden="true" /></button>
      </div>
      {loadError ? <div role="alert" className="admin-block-error"><p>No se pudo cargar el inventario. {loadError}</p><button type="button" className="shop-button shop-button-secondary" onClick={() => { setLoading(true); setRevision(value => value + 1); }}>Reintentar</button></div>
        : loading ? <div className="admin-product-list" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="admin-product-row is-placeholder" />)}</div>
        : filtered.length ? <div className="inventory-stock-grid">{filtered.map(item => <InventoryCard key={item.id} item={item} onEdit={setEditing} />)}</div>
        : <div className="admin-block-empty"><p>{items.length ? 'Ningún artículo coincide con estos filtros.' : 'Todavía no hay artículos en el inventario.'}</p>{items.length ? <button type="button" className="admin-text-link" onClick={() => { setSearch(''); setCategory(''); setMaterial(''); setReviewOnly(false); }}>Quitar filtros</button> : <button type="button" className="admin-text-link" onClick={() => setEditing(null)}>Agregar el primero</button>}</div>}
    </>}
    {movement.item && <InventoryMovementForm key={movement.item.id} item={movement.item} initialType={movement.type} onSave={submitMovement} onClose={() => setMovement({ item: null })} />}
  </section>;
}
