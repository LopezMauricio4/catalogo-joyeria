import { useEffect, useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';
import { fetchSales, createSale } from '../services/salesApi';
import SaleForm from '../components/SaleForm';
import { fetchInventory } from '../services/inventoryApi';
import { useToast } from '../hooks/useToast';

const money = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(Number(value));
const dateLabel = value => new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
const defaultServices = { fetchSales, createSale, fetchInventory };

export default function SalesPage({ services = defaultServices }) {
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [data, setData] = useState({ sales: [], pages: 1, total: 0 });
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    (async () => { const first = await services.fetchSales(1, controller.signal); const sales = [...first.sales]; for (let next = 2; next <= first.pages; next += 1) { const result = await services.fetchSales(next, controller.signal); sales.push(...result.sales); } return { ...first, sales }; })().then(result => { if (!controller.signal.aborted) { setData(result); setError(''); } }).catch(err => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision, services]);
  return <section className="admin-page sales-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <AdminNavigation /><div className="admin-toolbar mb-8"><div><p className="luxury-eyebrow">Administrador</p><h1 className="mt-3 text-5xl">Ventas</h1><p className="mt-3">Registro de ventas confirmadas y materiales vendidos.</p></div>{!adding && <button className="shop-button" onClick={() => setAdding(true)}>Agregar venta</button>}</div>
    {adding ? <SaleForm services={services} onCancel={() => setAdding(false)} onSaved={() => { showToast('Venta registrada e inventario actualizado', 'success'); setAdding(false); setLoading(true); setRevision(n => n + 1); }} /> : <>
      <div className="admin-toolbar"><p>{data.total} ventas registradas</p><button type="button" className="sales-refresh" aria-label="Actualizar lista de ventas" title="Actualizar lista" disabled={loading} onClick={() => { setLoading(true); setRevision(n => n + 1); }}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button></div>
      {error ? <p role="alert" className="product-editor-error my-5">{error}</p> : loading ? <p role="status">Cargando ventas…</p> : data.sales.length ? <div className="sales-list">{data.sales.map(sale => <article className="sale-record" key={sale.id}>
        <div className="sale-record-heading"><div><h2>{sale.customerName}</h2><p>{dateLabel(sale.occurredAt)}</p></div><div className="sale-record-total"><span>Total de venta</span><strong>{money(sale.total)}</strong></div></div>
        <div className="sale-record-meta"><span>{sale.customerPhone}</span><span>Registrada por {sale.createdByName}</span></div><dl className="sale-record-finances"><div><dt>Costo</dt><dd>{money(sale.totalCost)}</dd></div><div className={Number(sale.total) < Number(sale.totalCost) ? 'sale-record-loss' : ''}><dt>{Number(sale.total) < Number(sale.totalCost) ? 'Pérdida bruta' : 'Ganancia bruta'}</dt><dd>{money(Number(sale.total) - Number(sale.totalCost))}</dd></div></dl>
        <details className="sale-record-details">
          <summary><span>Detalle de venta <small>{sale.lines.length} {sale.lines.length === 1 ? 'artículo' : 'artículos'}</small></span><ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="sale-record-articles">{sale.lines.map(line => <div className="sale-record-article" key={line.id}>
            <h3>{line.name}</h3>
            <dl><div><dt>Cantidad</dt><dd>{Number(line.quantity)}</dd></div><div><dt>Costo unitario</dt><dd>{money(line.unitCost)}</dd></div><div><dt>Costo total</dt><dd>{money(line.totalCost)}</dd></div></dl>
          </div>)}</div>
          {sale.note && <div className="sale-record-note"><span>Nota</span><p>{sale.note}</p></div>}
          <dl className="sale-record-registration"><div><dt>Fecha de registro</dt><dd>{dateLabel(sale.createdAt)}</dd></div><div><dt>Referencia</dt><dd>{sale.id}</dd></div></dl>
        </details>
      </article>)}</div> : <p className="my-10">Todavía no hay ventas. Registra la primera con “Agregar venta”.</p>}
    </>}
  </section>;
}
