import { NavLink } from 'react-router-dom';
import { Gem, Package, ReceiptText } from 'lucide-react';
import '../styles/admin-workspace.css';
export default function AdminNavigation() {
  return <nav className="admin-module-nav" aria-label="Secciones de administración">
    <NavLink to="/admin/productos"><Gem size={20} aria-hidden="true" /><span>Productos</span></NavLink>
    <NavLink to="/admin/inventario"><Package size={20} aria-hidden="true" /><span>Inventario</span></NavLink>
    <NavLink to="/admin/ventas"><ReceiptText size={20} aria-hidden="true" /><span>Ventas</span></NavLink>
  </nav>;
}
