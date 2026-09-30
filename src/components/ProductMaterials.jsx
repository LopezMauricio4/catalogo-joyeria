import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchInventory } from '../services/inventoryApi';
import { summarizeMaterials } from '../utils/materialSummary';

const money = amount => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);

export default function ProductMaterials({ value, onChange, onUseSalePrice, children, loadInventory = fetchInventory }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadInventory(controller.signal).then(data => { if (!controller.signal.aborted) { setItems(data); setLoaded(true); setError(''); } }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [revision, loadInventory]);
  const available = !value.length ? 0 : Math.min(...value.map(part => {
    const item = items.find(item => item.id === part.itemId);
    return item?.active && Number(part.quantity) > 0 ? Math.floor((item.stock + 1e-9) / Number(part.quantity)) : 0;
  }));
  const update = (index, changes) => onChange(value.map((part, i) => i === index ? { ...part, ...changes } : part));
  const summary = summarizeMaterials(value, items);
  const canAdd = value.length < Math.min(items.length, 100);
  return <section className="product-editor-section">
    <div className="product-editor-section-title"><span>03</span><div><h3>Materiales y precio</h3></div></div>
    {error ? <p role="alert">{error} <button type="button" className="shop-button" onClick={() => setRevision(n => n + 1)}>Reintentar</button></p> : !loaded ? <p role="status">Cargando materiales…</p> : <>
      {value.map((part, index) => <div className="materials-row" key={index}>
        <label className="inventory-field">Material {index + 1}<select required value={part.itemId} onChange={event => update(index, { itemId: event.target.value })}><option value="">Selecciona un insumo</option>{items.filter(item => item.id === part.itemId || !value.some(row => row.itemId === item.id)).map(item => <option key={item.id} value={item.id}>{item.sku} · {item.name} {item.size || ''} · {item.material} ({item.stock} {item.unit}{item.active ? '' : ', inactivo'})</option>)}</select></label>
        <label className="inventory-field">Cantidad por pieza<input required type="number" min="0.000001" step="0.000001" value={part.quantity} onChange={event => update(index, { quantity: event.target.value })} /></label>
        <button type="button" className="shop-button" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label={`Quitar material ${index + 1}`}>Quitar</button>
      </div>)}
      <button type="button" className="shop-button" disabled={!canAdd} onClick={() => onChange([...value, { itemId: '', quantity: '1' }])}>{value.length ? '+ Agregar otro material' : '+ Agregar material'}</button>
      {!items.length && <p>Primero agrega tus insumos en <Link to="/admin/inventario" className="underline">Inventario</Link>.</p>}
      {value.length > 0 && <section className="materials-summary" aria-label="Resumen de materiales y precios">
        <h4 className="text-2xl">Resumen por pieza (COP)</h4>
        <div className="sale-table-wrap materials-desktop-summary"><table className="sale-table"><thead><tr><th>Material</th><th>Cantidad</th><th>Costo unitario</th><th>Costo subtotal</th><th>Venta unitaria</th><th>Venta subtotal</th></tr></thead><tbody>
          {summary.rows.map((row, index) => <tr key={index}><td>{row.item ? `${row.item.name}${row.item.size ? ` · ${row.item.size}` : ''} (${row.item.sku})` : `Material ${index + 1} pendiente`}</td><td>{row.valid ? `${row.quantity} ${row.item.unit}` : 'Revisar cantidad'}</td><td>{row.item ? money(row.item.unitCost) : '—'}</td><td>{row.valid ? money(row.costCents / 100) : '—'}</td><td>{row.item ? money(row.item.salePrice) : '—'}</td><td>{row.valid ? money(row.saleCents / 100) : '—'}</td></tr>)}
        </tbody></table></div>
        <div className="materials-mobile-summary">
          {summary.rows.map((row, index) => <article className="materials-mobile-item" key={index}>
            <h5>{row.item ? `${row.item.name}${row.item.size ? ` · ${row.item.size}` : ''}` : `Material ${index + 1} pendiente`}</h5>
            {row.item && <p>{row.item.sku}</p>}
            <dl>
              <div><dt>Cantidad</dt><dd>{row.valid ? `${row.quantity} ${row.item.unit}` : 'Revisar cantidad'}</dd></div>
              <div><dt>Costo unitario</dt><dd>{row.item ? money(row.item.unitCost) : '—'}</dd></div>
              <div><dt>Costo subtotal</dt><dd>{row.valid ? money(row.costCents / 100) : '—'}</dd></div>
              <div><dt>Venta unitaria</dt><dd>{row.item ? money(row.item.salePrice) : '—'}</dd></div>
              <div><dt>Venta subtotal</dt><dd>{row.valid ? money(row.saleCents / 100) : '—'}</dd></div>
            </dl>
          </article>)}
        </div>
        <div className="materials-totals" aria-live="polite"><div><span>Costo total de materiales</span><strong>{money(summary.totalCost)}</strong></div><div><span>Venta sugerida según materiales</span><strong>{money(summary.totalSale)}</strong></div></div>
        {!summary.complete && <p role="status">El resumen es parcial: selecciona todos los materiales y revisa sus cantidades.</p>}
        {onUseSalePrice && <button type="button" className="shop-button" disabled={!summary.complete || summary.totalSale <= 0} onClick={() => onUseSalePrice(summary.totalSale)}>Usar precio sugerido</button>}
      </section>}
      <p role="status" className="product-editor-note">{value.length ? `Disponibilidad: ${available} piezas${available === 0 ? ' · Agotada' : ''}` : 'Sin materiales asignados.'}</p>
    </>}
    {children}
  </section>;
}
