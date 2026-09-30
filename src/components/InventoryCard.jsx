import ProductImage from './ProductImage';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });
const quantity = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 });
const sizeUnits = { gramo: 'g', metro: 'm', milimetro: 'mm' };
const statuses = { inactive: 'Inactivo', empty: 'Sin existencias', low: 'Stock bajo', available: 'Disponible' };

export default function InventoryCard({ item, onEdit }) {
  const status = item.active === false ? 'inactive' : Number(item.stock) <= 0 ? 'empty' : Number(item.stock) <= Number(item.minStock) ? 'low' : 'available';
  const size = String(item.size ?? '').trim();
  const sizeLabel = sizeUnits[item.unit] && /^#?\s*\d+(?:[.,]\d+)?$/.test(size) ? `${size} ${sizeUnits[item.unit]}` : size;
  const measurements = [sizeLabel, item.lengthCm && `${quantity.format(Number(item.lengthCm))} cm`, item.thicknessMm && `${quantity.format(Number(item.thicknessMm))} mm`, item.weightGrams && `${quantity.format(Number(item.weightGrams))} g`].filter(Boolean).join(' · ');

  return <button type="button" className="inventory-stock-card" onClick={() => onEdit(item)} aria-label={`Editar cantidades y precios de ${item.name}`}>
      <span className="inventory-stock-photo"><ProductImage src={item.image} alt={item.name} /></span>
      <span className="inventory-stock-content">
        <strong className="inventory-stock-name">{item.name}</strong>
        <span className="inventory-stock-material">{item.material || 'Sin material'}{measurements && ` · ${measurements}`}</span>
        <span className="inventory-stock-line"><span>Venta</span><strong>{money.format(Number(item.salePrice))}</strong></span>
        <span className="inventory-stock-line"><span>Costo</span><strong>{money.format(Number(item.unitCost))}</strong></span>
        <span className="inventory-stock-line"><span>Disponible</span><strong>{quantity.format(Number(item.stock))}</strong></span>
        <span className={`inventory-stock-badge is-${status}`}>{statuses[status]}</span>
      </span>
  </button>;
}
