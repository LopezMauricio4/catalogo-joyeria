import ProductImage from './ProductImage';
import { inventoryName } from '../utils/inventoryName';
import { useId, useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quantity = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 });
const statuses = { inactive: 'Inactivo', empty: 'Sin existencias', low: 'Stock bajo', available: 'Disponible' };

export default function InventoryCard({ item, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const status = item.active === false ? 'inactive' : Number(item.stock) <= 0 ? 'empty' : Number(item.stock) <= Number(item.minStock) ? 'low' : 'available';
  const name = inventoryName(item);

  return <article className="inventory-data-row">
    <div className="inventory-row-summary">
      <div className="inventory-row-photo"><ProductImage src={item.image} alt={item.name} /></div>
      <div className="inventory-row-identity"><h2>{name}</h2><p>{item.material || 'Sin material'}{Number(item.weightGrams) > 0 && ` · ${quantity.format(Number(item.weightGrams))} g`}</p><span className={`inventory-row-status is-${status}`}>{statuses[status]}</span></div>
      <dl className="inventory-row-figures">
        <div><dt>Disponible · {item.unit}</dt><dd>{quantity.format(Number(item.stock))}</dd></div>
        <div><dt>Costo · COP</dt><dd>{money.format(Number(item.unitCost))}</dd></div>
        <div><dt>Venta · COP</dt><dd>{money.format(Number(item.salePrice))}</dd></div>
      </dl>
      <div className="inventory-row-actions"><button type="button" onClick={() => onEdit(item)} aria-label={`Editar cantidades y precios de ${name}`}><Pencil size={18} aria-hidden="true" /></button><button type="button" aria-expanded={expanded} aria-controls={detailsId} aria-label={`${expanded ? 'Ocultar' : 'Ver'} detalles de ${name}`} onClick={() => setExpanded(value => !value)}><ChevronDown size={18} aria-hidden="true" /></button></div>
    </div>
    <div id={detailsId} hidden={!expanded} className="inventory-row-details">
      <dl><div><dt>Nombre completo</dt><dd>{name}</dd></div><div><dt>SKU</dt><dd className="admin-data-number">{item.sku || item.id}</dd></div><div><dt>Categoría</dt><dd>{item.category}</dd></div><div><dt>Stock mínimo</dt><dd className="admin-data-number">{quantity.format(Number(item.minStock))} {item.unit}</dd></div>{item.size && <div><dt>Tamaño</dt><dd>{item.size}</dd></div>}{Number(item.lengthCm) > 0 && <div><dt>Longitud</dt><dd>{quantity.format(Number(item.lengthCm))} cm</dd></div>}{Number(item.thicknessMm) > 0 && <div><dt>Grosor</dt><dd>{quantity.format(Number(item.thicknessMm))} mm</dd></div>}</dl>
      {item.description && <p>{item.description}</p>}
    </div>
  </article>;
}
