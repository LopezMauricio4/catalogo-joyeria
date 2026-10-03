import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { addInventoryMovement, createInventoryItem, fetchInventory, updateInventoryItem } from '../services/inventoryApi';
import ProductImage from '../components/ProductImage';
import InventoryCard from '../components/InventoryCard';
import InventoryMovementForm from '../components/InventoryMovementForm';
import AdminNavigation from '../components/AdminNavigation';
import { inventoryName } from '../utils/inventoryName';
import { normalizeText } from '../utils/catalog';

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
  const [revision, setRevision] = useState(0);
  const [movement, setMovement] = useState({ item: null, type: 'PURCHASE', quantity: '', note: '' });
  const controllerRef = useRef(null);
  useEffect(() => { controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller; fetchInventory(controller.signal).then(data => { if (!controller.signal.aborted) setItems(data); }).catch(error => { if (error.name !== 'AbortError') showToast(error.message, 'error'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [revision, showToast]);
  const filtered = useMemo(() => items.filter(item => (!category || item.category === category) && (!material || item.material === material) && normalizeText(inventoryName(item)).includes(normalizeText(search))), [items, search, category, material]);
  const saved = item => { setItems(current => current.some(value => value.id === item.id) ? current.map(value => value.id === item.id ? item : value) : [item, ...current]); setEditing(undefined); };
  const openMovement = (item, type) => setMovement({ item, type, quantity: '', note: '' });
  const submitMovement = async data => { const item = await addInventoryMovement(movement.item.id, data); setItems(current => current.map(value => value.id === item.id ? item : value)); setEditing(current => current?.id === item.id ? item : current); setMovement({ item: null }); showToast('Existencias actualizadas', 'success'); };
  return <section className="admin-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <AdminNavigation />
    <div className="admin-toolbar mb-8"><div><p className="luxury-eyebrow">Administrador</p><h1 className="mt-3 text-5xl">Inventario</h1><p className="mt-3 max-w-2xl text-ink-muted">Controla insumos, variantes, costos y movimientos de stock.</p></div><Link to="/admin/productos">Volver al catálogo admin →</Link></div>
    {editing !== undefined ? <ItemForm item={editing} onMovement={openMovement} onSaved={saved} onCancel={() => setEditing(undefined)} /> : <>
      <div className="admin-options"><button onClick={() => setEditing(null)}><Plus /><strong>Agregar artículo</strong><span>Registra un insumo o variante</span></button><div className="admin-options-summary"><Package /><strong>{items.length} artículos</strong><span>{items.filter(item => item.stock <= item.minStock).length} requieren revisión de stock</span></div></div>
      <div className="admin-filters inventory-filters"><label>Buscar<input className="admin-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre…" /></label><label>Categoría<select value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label>Material<select value={material} onChange={event => setMaterial(event.target.value)}><option value="">Todos</option>{materials.map(value => <option key={value} value={value}>{materialLabels[value]}</option>)}</select></label><button type="button" className="shop-button inventory-refresh" aria-label="Actualizar inventario" title="Actualizar inventario" disabled={loading} onClick={() => { setLoading(true); setRevision(value => value + 1); }}><RefreshCw size={16} /></button></div>
      {loading ? <p role="status" className="my-8">Cargando inventario…</p> : <div className="inventory-stock-grid">{filtered.map(item => <InventoryCard key={item.id} item={item} onEdit={setEditing} />)}</div>}
      {!loading && !filtered.length && <p className="py-10 text-center">No hay artículos con esos filtros.</p>}
    </>}
    {movement.item && <InventoryMovementForm key={movement.item.id} item={movement.item} initialType={movement.type} onSave={submitMovement} onClose={() => setMovement({ item: null })} />}
  </section>;
}
