import ProductImage from './ProductImage';
import { inventoryName } from '../utils/inventoryName';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });
const quantity = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 });
const statuses = { inactive: 'Inactivo', empty: 'Sin existencias', low: 'Stock bajo', available: 'Disponible' };

export default function InventoryCard({ item, onEdit }) {
  const status = item.active === false ? 'inactive' : Number(item.stock) <= 0 ? 'empty' : Number(item.stock) <= Number(item.minStock) ? 'low' : 'available';
  const name = inventoryName(item);

  return <button type="button" className="inventory-stock-card" onClick={() => onEdit(item)} aria-label={`Editar cantidades y precios de ${name}`}>
      <span className="inventory-stock-photo"><ProductImage src={item.image} alt={item.name} /></span>
      <span className="inventory-stock-content">
        <strong className="inventory-stock-name">{name}</strong>
        <span className="inventory-stock-material">{item.material || 'Sin material'}{Number(item.weightGrams) > 0 && ` · ${quantity.format(Number(item.weightGrams))} g`}</span>
        <span className="inventory-stock-line"><span>Venta</span><strong>{money.format(Number(item.salePrice))}</strong></span>
        <span className="inventory-stock-line"><span>Costo</span><strong>{money.format(Number(item.unitCost))}</strong></span>
        <span className="inventory-stock-line"><span>Disponible</span><strong>{quantity.format(Number(item.stock))}</strong></span>
        <span className={`inventory-stock-badge is-${status}`}>{statuses[status]}</span>
      </span>
  </button>;
}
