import { useState } from 'react';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { inventoryName } from '../utils/inventoryName';

const quantityFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 });
const units = { unidad: 'unidades', par: 'pares', gramo: 'g', metro: 'm', milimetro: 'mm' };

export default function InventoryMovementForm({ item, initialType, onSave, onClose }) {
  const [type, setType] = useState(initialType);
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const adding = ['PURCHASE', 'RETURN'].includes(type);
  const amount = Number(quantity);
  const validAmount = Number.isFinite(amount) && amount > 0;
  const stock = Number(item.stock);
  const remaining = stock + (adding ? amount : -amount);
  const overStock = validAmount && !adding && remaining < 0;
  const unit = units[item.unit] || item.unit;
  const close = () => { if (!busy) onClose(); };
  const submit = async event => {
    event.preventDefault();
    if (busy || !validAmount || overStock) return;
    setError(''); setBusy(true);
    try { await onSave({ type, quantity, note }); }
    catch (failure) { setError(failure.message || 'No se pudo registrar el movimiento. Intenta nuevamente.'); }
    finally { setBusy(false); }
  };
  return <Modal open onClose={close} title="Actualizar existencias" className="inventory-movement-dialog">
    <form className="inventory-movement-form" onSubmit={submit}>
      <div className="inventory-movement-item"><h3>{inventoryName(item)}</h3><p>{item.material}</p></div>
      <fieldset disabled={busy}>
        <div className="inventory-movement-toggle" role="group" aria-label="Movimiento">
          <button type="button" aria-pressed={adding} onClick={() => { setType('PURCHASE'); setError(''); }}><ArrowUp size={16} />Agregar</button>
          <button type="button" aria-pressed={!adding} onClick={() => { setType('CONSUMPTION'); setError(''); }}><ArrowDown size={16} />Retirar</button>
        </div>
        <label className="inventory-field">Cantidad a {adding ? 'agregar' : 'retirar'} ({unit})
          <input autoFocus required type="number" inputMode="decimal" min="0.000001" step="0.000001" max={adding ? undefined : stock} value={quantity} onChange={event => { setQuantity(event.target.value); setError(''); }} placeholder="Ej. 10" aria-invalid={overStock} aria-describedby="movement-stock-preview" />
        </label>
        <div id="movement-stock-preview" className="inventory-movement-preview" aria-live="polite">
          <div><span>Existencias actuales</span><strong>{quantityFormat.format(stock)} {unit}</strong></div>
          <div><span>Después del movimiento</span><strong>{validAmount && !overStock ? `${quantityFormat.format(remaining)} ${unit}` : '—'}</strong></div>
        </div>
        {overStock && <p role="alert" className="product-editor-error">Solo puedes retirar hasta {quantityFormat.format(stock)} {unit}.</p>}
        <label className="inventory-field">Motivo<select value={type} onChange={event => setType(event.target.value)}>{adding ? <><option value="PURCHASE">Compra / entrada</option><option value="RETURN">Devolución</option></> : <><option value="CONSUMPTION">Uso de insumos</option><option value="ADJUSTMENT">Corrección de existencias</option></>}</select></label>
        <label className="inventory-field">Nota (opcional)<textarea rows="2" value={note} onChange={event => setNote(event.target.value)} placeholder="Ej. Compra al proveedor o insumos usados" /></label>
        {error && <p role="alert" className="product-editor-error">{error}</p>}
        <div className="inventory-movement-actions"><button type="button" className="shop-button" onClick={close}>Cancelar</button><button className="luxury-btn luxury-btn-primary" disabled={!validAmount || overStock}>{busy ? <><Loader2 size={16} className="animate-spin" />Guardando…</> : adding ? 'Agregar existencias' : 'Retirar existencias'}</button></div>
      </fieldset>
    </form>
  </Modal>;
}
