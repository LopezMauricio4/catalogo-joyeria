import { useEffect, useState } from 'react';
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
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    services.fetchSales(page, controller.signal).then(result => { if (!controller.signal.aborted) { setData(result); setError(''); } }).catch(err => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, revision, services]);
  return <section className="admin-page mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <AdminNavigation /><div className="admin-toolbar mb-8"><div><p className="luxury-eyebrow">Administrador</p><h1 className="mt-3 text-5xl">Ventas</h1><p className="mt-3">Registro de ventas confirmadas y materiales vendidos.</p></div>{!adding && <button className="shop-button" onClick={() => setAdding(true)}>Agregar venta</button>}</div>
    {adding ? <SaleForm services={services} onCancel={() => setAdding(false)} onSaved={() => { showToast('Venta registrada e inventario actualizado', 'success'); setAdding(false); setPage(1); setLoading(true); setRevision(n => n + 1); }} /> : <>
      <div className="admin-toolbar"><p>{data.total} ventas registradas</p><button className="shop-button" disabled={loading} onClick={() => { setLoading(true); setRevision(n => n + 1); }}>Actualizar lista</button></div>
      {error ? <p role="alert" className="product-editor-error my-5">{error}</p> : loading ? <p role="status">Cargando ventas…</p> : data.sales.length ? <div className="sales-list">{data.sales.map(sale => <article className="sale-record" key={sale.id}>
        <div className="admin-toolbar"><h2 className="text-2xl">{sale.customerName}</h2><strong>{money(sale.total)}</strong></div>
        <p>{sale.customerPhone} · {dateLabel(sale.occurredAt)}</p><p>Registrada por {sale.createdByName}</p><p>Costo: {money(sale.totalCost)} · Ganancia bruta: {money(Number(sale.total) - Number(sale.totalCost))}</p>
        <details><summary>Ver artículos y registro</summary><p className="text-sm my-3">Referencia: {sale.id}<br />Registrada el {dateLabel(sale.createdAt)}</p><div className="sale-table-wrap"><table className="sale-table"><thead><tr><th>Artículo</th><th>Cantidad</th><th>Costo unitario</th><th>Costo total</th></tr></thead><tbody>{sale.lines.map(line => <tr key={line.id}><td>{line.name}{line.sku && ` · ${line.sku}`}</td><td>{Number(line.quantity)} {line.unit}</td><td>{money(line.unitCost)}</td><td>{money(line.totalCost)}</td></tr>)}</tbody></table></div>{sale.note && <p className="mt-3">Nota: {sale.note}</p>}</details>
      </article>)}</div> : <p className="my-10">Todavía no hay ventas. Registra la primera con “Agregar venta”.</p>}
      <div className="admin-toolbar mt-6"><button className="shop-button" disabled={loading || page <= 1} onClick={() => { setLoading(true); setPage(n => n - 1); }}>Anterior</button><span>Página {page} de {data.pages}</span><button className="shop-button" disabled={loading || page >= data.pages} onClick={() => { setLoading(true); setPage(n => n + 1); }}>Siguiente</button></div>
    </>}
  </section>;
}
