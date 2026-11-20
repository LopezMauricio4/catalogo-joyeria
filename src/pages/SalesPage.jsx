import { useEffect, useState } from 'react';
import { ChevronDown, Plus, RefreshCw } from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';
import { fetchSales, createSale } from '../services/salesApi';
import SaleForm from '../components/SaleForm';
import { fetchInventory } from '../services/inventoryApi';
import { useToast } from '../hooks/useToast';

import { formatCop as money, monthSummary, plural } from '../utils/adminFormat';

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
  const now = new Date();
  const summary = monthSummary(data.sales, now);
  const monthLabel = now.toLocaleDateString('es-CO', { month: 'long' });
  return <section className="admin-page sales-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <AdminNavigation />
    <div className="admin-toolbar admin-page-heading"><div><h1>Ventas</h1><p>Ventas confirmadas y materiales vendidos.</p></div>{!adding && <div className="admin-heading-actions"><button type="button" className="luxury-btn luxury-btn-primary" onClick={() => setAdding(true)}><Plus size={18} aria-hidden="true" />Registrar venta</button></div>}</div>
    {adding ? <SaleForm services={services} onCancel={() => setAdding(false)} onSaved={() => { showToast('Venta registrada e inventario actualizado', 'success'); setAdding(false); setLoading(true); setRevision(n => n + 1); }} /> : <>
      {!loading && !error && <dl className="sales-month" aria-label={`Resumen de ${monthLabel}`}>
        <div><dt>Ventas en {monthLabel}</dt><dd>{summary.count}</dd></div>
        <div><dt>Vendido en {monthLabel}</dt><dd>{money(summary.total)}</dd></div>
        <div className={summary.profit < 0 ? 'sale-record-loss' : ''}><dt>{summary.profit < 0 ? 'Pérdida bruta' : 'Ganancia bruta'}</dt><dd>{money(summary.profit)}</dd></div>
      </dl>}
      <div className="admin-list-status"><p role="status">{loading ? 'Cargando ventas…' : error ? 'Ventas no disponibles' : `${plural(data.total, 'venta registrada', 'ventas registradas')} en total`}</p><button type="button" className="admin-icon-button" aria-label="Actualizar lista de ventas" title="Actualizar lista" disabled={loading} onClick={() => { setLoading(true); setRevision(n => n + 1); }}><RefreshCw size={18} aria-hidden="true" /></button></div>
      {error ? <div role="alert" className="admin-block-error"><p>No se pudieron cargar las ventas. {error}</p><button type="button" className="shop-button shop-button-secondary" onClick={() => { setLoading(true); setRevision(n => n + 1); }}>Reintentar</button></div> : loading ? <div className="admin-product-list" aria-hidden="true">{Array.from({ length: 3 }, (_, index) => <div key={index} className="admin-product-row is-placeholder" />)}</div> : data.sales.length ? <div className="sales-list">{data.sales.map(sale => <article className="sale-record" key={sale.id}>
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
      </article>)}</div> : <div className="admin-block-empty"><p>Todavía no hay ventas registradas.</p><button type="button" className="admin-text-link" onClick={() => setAdding(true)}>Registrar la primera</button></div>}
    </>}
  </section>;
}
