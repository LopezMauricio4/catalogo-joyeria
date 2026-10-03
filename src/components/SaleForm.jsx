import { useEffect, useRef, useState } from 'react';
import { inventoryName } from '../utils/inventoryName';

const money = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(value);
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
  return <form className="inventory-form sales-form admin-form-compact" onSubmit={submit}>
    <h2 className="text-3xl">Registrar venta</h2>
    <fieldset disabled={busy || loading || Boolean(loadError)}>
      <div className="inventory-fields inventory-fields-three my-6">
        <label className="inventory-field">Nombre del cliente<input required name="customerName" maxLength={150} value={form.customerName} onChange={update} /></label>
        <label className="inventory-field">Teléfono del cliente<input required name="customerPhone" type="tel" maxLength={40} value={form.customerPhone} onChange={update} /></label>
        <label className="inventory-field">Fecha y hora<input required name="occurredAt" type="datetime-local" max={localNow()} value={form.occurredAt} onChange={update} /></label>
      </div>
      <section className="sale-line-editor">

        <div className="sale-article-picker">
          <label className="inventory-field">Artículo<select ref={picker} value={draft.id} onChange={e => setDraft({ id: e.target.value, quantity: '1' })}><option value="">Selecciona un insumo…</option>{inventory.filter(item => item.active).map(item => <option key={item.id} value={item.id}>{inventoryName(item)} · {item.material} · {item.stock} disponibles</option>)}</select></label>
          <label className="inventory-field">Cantidad<input type="number" min={(selected?.category === 'balines' || ['unidad', 'par'].includes(selected?.unit)) ? '1' : '0.000001'} step={(selected?.category === 'balines' || ['unidad', 'par'].includes(selected?.unit)) ? '1' : '0.000001'} value={draft.quantity} onChange={e => setDraft({ ...draft, quantity: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} /></label>
          <button type="button" className="shop-button" onClick={add}>Agregar</button>
        </div>
      </section>
      {rows.length > 0 && <section className="sale-items-summary" aria-label="Artículos de la venta">

        {rows.map(row => <article className="sale-summary-item" key={row.id}>
          <div><h4>{row.item && inventoryName(row.item)}</h4><p>{row.item?.material}</p></div>
          <dl><div><dt>Cantidad</dt><dd>{row.quantity}</dd></div><div><dt>Costo unitario</dt><dd>{money(Number(row.item?.unitCost || 0))}</dd></div><div><dt>Costo total</dt><dd>{money(cents(Number(row.item?.unitCost || 0) * row.quantity) / 100)}</dd></div></dl>
          <button type="button" className="shop-button shop-button-secondary" aria-label={`Quitar ${row.item?.name}`} onClick={() => setLines(current => current.filter(line => line.id !== row.id))}>Quitar</button>
        </article>)}
      </section>}
      <label className="inventory-field my-5">Nota opcional<textarea rows="2" name="note" maxLength={1000} value={form.note} onChange={update} /></label>
      <section className="sale-price-summary">
        <label className="inventory-field">Valor total de la venta (COP)<input required name="total" type="number" inputMode="decimal" min="0" max="1000000000" step="0.01" value={form.total} onChange={update} /></label>
        <div className="materials-totals" aria-live="polite"><div><span>Costo total de artículos</span><strong>{money(costCents / 100)}</strong></div><div className={profit !== null && profit < 0 ? 'sale-loss' : ''}><span>{profit !== null && profit < 0 ? 'Pérdida bruta' : 'Ganancia bruta'}</span><strong>{profit === null ? '—' : money(profit)}</strong></div></div>
      </section>
      <button className="luxury-btn luxury-btn-primary mt-6" type="submit" disabled={!lines.length}>{busy ? 'Registrando…' : 'Registrar venta'}</button>
    </fieldset>
    {loading && <p role="status">Cargando artículos…</p>}
    {loadError && <p role="alert">{loadError} <button type="button" className="shop-button" onClick={() => { setLoading(true); setRevision(n => n + 1); }}>Reintentar</button></p>}
    {error && <p role="alert" className="product-editor-error mt-4">{error}</p>}
    <button type="button" className="shop-button mt-4" disabled={busy} onClick={onCancel}>Volver a ventas</button>
  </form>;
}
