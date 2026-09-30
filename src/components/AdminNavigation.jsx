import { NavLink } from 'react-router-dom';
export default function AdminNavigation() {
  return <nav className="admin-module-nav" aria-label="Secciones de administración">
    <NavLink to="/admin/productos">Productos</NavLink>
    <NavLink to="/admin/inventario">Inventario</NavLink>
    <NavLink to="/admin/ventas">Ventas</NavLink>
  </nav>;
}
