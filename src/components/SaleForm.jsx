import { useEffect, useRef, useState } from 'react';
import { inventoryName } from '../utils/inventoryName';
import { formatCop as money } from '../utils/adminFormat';
const localNow = () => { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const cents = value => Math.round((Number(value) + Number.EPSILON) * 100);

export default function SaleForm({ onSaved, onCancel, services }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const requestKey = useRef(crypto.randomUUID());
  const [form, setForm] = useState({ customerName: '', customerPhone: '', occurredAt: localNow(), note: '', total: '' });
  const [draft, setDraft] = useState({ id: '', quantity: '1' });
  const [lines, setLines] = useState([]);
  const picker = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    services.fetchInventory(controller.signal).then(items => {
      if (!controller.signal.aborted) { setInventory(items); setLoadError(''); setLoading(false); }
    }).catch(err => { if (!controller.signal.aborted) { setLoadError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, [revision, services]);
  const selected = inventory.find(item => item.id === draft.id);
  const add = () => {
    const qty = Number(draft.quantity);
    const previous = lines.find(line => line.id === draft.id);
    const combined = Math.round((qty + Number(previous?.quantity || 0)) * 1e6) / 1e6;
    if (!selected?.active || !Number.isFinite(qty) || qty <= 0 || Math.abs(qty * 1e6 - Math.round(qty * 1e6)) > 0.00001) { setError('Selecciona un artículo y una cantidad válida.'); return; }
    if ((selected.category === 'balines' || ['unidad', 'par'].includes(selected.unit)) && !Number.isInteger(qty)) { setError('Indica una cantidad entera.'); return; }
    if (combined > Number(selected.stock)) { setError(`Solo hay ${selected.stock} disponibles de ${selected.name}.`); return; }
    if (!previous && lines.length >= 50) { setError('Puedes registrar hasta 50 artículos distintos.'); return; }
    setLines(current => previous ? current.map(line => line.id === draft.id ? { ...line, quantity: combined } : line) : [...current, { id: draft.id, quantity: qty }]);
    setDraft({ id: '', quantity: '1' }); setError(''); picker.current?.focus();
  };
  const rows = lines.map(line => ({ ...line, item: inventory.find(item => item.id === line.id) }));
  const costCents = rows.reduce((sum, row) => sum + cents(Number(row.item?.unitCost || 0) * row.quantity), 0);
  const validTotal = form.total !== '' && Number.isFinite(Number(form.total)) && Number(form.total) >= 0;
  const profit = validTotal ? (cents(form.total) - costCents) / 100 : null;
  const submit = async event => {
    event.preventDefault(); if (lock.current) return;
    setError('');
    if (draft.id) { setError('Agrega el artículo seleccionado al resumen antes de registrar la venta.'); return; }
    if (!lines.length || !validTotal) { setError('Agrega artículos e indica el valor total de la venta.'); return; }
    lock.current = true; setBusy(true);
    try {
      const data = await services.createSale({ ...form, occurredAt: new Date(form.occurredAt).toISOString(), requestKey: requestKey.current,
        lines: lines.map(line => ({ ...line, kind: 'inventory' })) });
      onSaved(data.sale);
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(false); }
  };
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const dirty = lines.length > 0 || Boolean(draft.id) || Boolean(form.customerName || form.customerPhone || form.note || form.total);
  const cancel = () => { if (!dirty || window.confirm('¿Descartar esta venta? Se perderán los datos escritos.')) onCancel(); };
  return <form className="inventory-form sales-form admin-form-compact" onSubmit={submit}>
    <h2>Registrar venta</h2>
    <fieldset disabled={busy || loading || Boolean(loadError)} className="sale-form-body">
      <section className="sale-form-section" aria-labelledby="sale-customer">
        <h3 id="sale-customer">Cliente</h3>
        <div className="inventory-fields inventory-fields-three">
          <label className="inventory-field">Nombre del cliente<input required name="customerName" autoComplete="off" maxLength={150} value={form.customerName} onChange={update} /></label>
          <label className="inventory-field">Teléfono del cliente<input required name="customerPhone" type="tel" inputMode="tel" autoComplete="off" maxLength={40} value={form.customerPhone} onChange={update} /></label>
          <label className="inventory-field">Fecha y hora<input required name="occurredAt" type="datetime-local" max={localNow()} value={form.occurredAt} onChange={update} /></label>
        </div>
      </section>
      <section className="sale-form-section" aria-labelledby="sale-articles">
        <h3 id="sale-articles">Artículos</h3>
        <div className="sale-article-picker">
          <label className="inventory-field">Artículo<select ref={picker} value={draft.id} onChange={e => setDraft({ id: e.target.value, quantity: '1' })}><option value="">Selecciona un insumo…</option>{inventory.filter(item => item.active).map(item => <option key={item.id} value={item.id}>{inventoryName(item)} · {item.material} · {item.stock} disponibles</option>)}</select></label>
          <label className="inventory-field">Cantidad<input type="number" inputMode="decimal" min={(selected?.category === 'balines' || ['unidad', 'par'].includes(selected?.unit)) ? '1' : '0.000001'} step={(selected?.category === 'balines' || ['unidad', 'par'].includes(selected?.unit)) ? '1' : '0.000001'} value={draft.quantity} onChange={e => setDraft({ ...draft, quantity: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} /></label>
          <button type="button" className="shop-button shop-button-secondary" onClick={add}>Agregar</button>
        </div>
        {rows.length > 0 ? <ul className="sale-items-summary" aria-label="Artículos de la venta">
          {rows.map(row => <li className="sale-summary-item" key={row.id}>
            <div><h4>{row.item && inventoryName(row.item)}</h4><p>{row.item?.material}</p></div>
            <dl><div><dt>Cantidad</dt><dd>{row.quantity}</dd></div><div><dt>Costo unitario</dt><dd>{money(Number(row.item?.unitCost || 0))}</dd></div><div><dt>Costo total</dt><dd>{money(cents(Number(row.item?.unitCost || 0) * row.quantity) / 100)}</dd></div></dl>
            <button type="button" className="admin-text-link" aria-label={`Quitar ${row.item?.name}`} onClick={() => setLines(current => current.filter(line => line.id !== row.id))}>Quitar</button>
          </li>)}
        </ul> : <p className="sale-form-hint">Elige un artículo y su cantidad, y pulsa Agregar. Puedes sumar varios.</p>}
      </section>
      <section className="sale-form-section" aria-labelledby="sale-total">
        <h3 id="sale-total">Total y nota</h3>
        <div className="sale-price-summary">
          <label className="inventory-field">Valor total de la venta (COP)<input required name="total" type="number" inputMode="decimal" min="0" max="1000000000" step="0.01" value={form.total} onChange={update} /></label>
          <div className="materials-totals" aria-live="polite"><div><span>Costo total de artículos</span><strong>{money(costCents / 100)}</strong></div><div className={profit !== null && profit < 0 ? 'sale-loss' : ''}><span>{profit !== null && profit < 0 ? 'Pérdida bruta' : 'Ganancia bruta'}</span><strong>{profit === null ? '—' : money(profit)}</strong></div></div>
        </div>
        <label className="inventory-field">Nota opcional<textarea rows="2" name="note" maxLength={1000} value={form.note} onChange={update} /></label>
      </section>
    </fieldset>
    {loading && <p role="status" className="sale-form-hint">Cargando artículos del inventario…</p>}
    {loadError && <div role="alert" className="admin-block-error"><p>No se pudieron cargar los artículos. {loadError}</p><button type="button" className="shop-button shop-button-secondary" onClick={() => { setLoading(true); setRevision(n => n + 1); }}>Reintentar</button></div>}
    {error && <p role="alert" className="product-editor-error mt-4">{error}</p>}
    <div className="inventory-form-actions sale-form-actions">
      <button className="luxury-btn luxury-btn-primary" type="submit" disabled={busy || loading || Boolean(loadError)}>{busy ? 'Registrando…' : 'Registrar venta'}</button>
      <button type="button" className="shop-button shop-button-secondary" disabled={busy} onClick={cancel}>Cancelar</button>
    </div>
  </form>;
}
