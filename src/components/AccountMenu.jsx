import { ArrowRight, LoaderCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountMenu({ user, onNavigate, onLogout, loggingOut = false }) {
  const loggedIn = user && user.role !== 'guest';
  return <div className="account-menu-content">
    {loggedIn ? <>
      <div className="account-menu-identity"><p className="account-menu-name">{user.userName || 'Tu cuenta'}</p>{user.email && <p>{user.email}</p>}</div>
      {user.role === 'admin' && <nav className="account-menu-admin" aria-label="Administración">
        <Link to="/admin/productos" onClick={onNavigate}>Administrar productos <ArrowRight size={18} aria-hidden="true" /></Link>
        <Link to="/admin/inventario" onClick={onNavigate}>Inventario <ArrowRight size={18} aria-hidden="true" /></Link>
        <Link to="/admin/ventas" onClick={onNavigate}>Ventas <ArrowRight size={18} aria-hidden="true" /></Link>
      </nav>}
      <Link className="account-menu-link" to="/carrito" onClick={onNavigate}>Ver mi carrito <ArrowRight size={18} aria-hidden="true" /></Link>
      <button type="button" className="navigation-action navigation-action-secondary" onClick={onLogout} disabled={loggingOut} aria-busy={loggingOut}>
        {loggingOut ? <LoaderCircle size={18} className="logout-spinner" aria-hidden="true" /> : <LogOut size={18} aria-hidden="true" />}{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </> : <>
      <p className="account-menu-intro">Accede a tu cuenta o crea una nueva.</p>
      <div className="account-menu-actions">
        <Link className="navigation-action navigation-action-primary" to="/auth" onClick={onNavigate}>Iniciar sesión <ArrowRight size={18} aria-hidden="true" /></Link>
        <Link className="navigation-action navigation-action-secondary" to="/auth?mode=register" onClick={onNavigate}>Crear cuenta</Link>
      </div>
      <p className="account-menu-note">Puedes explorar y comprar sin crear una cuenta.</p>
    </>}
  </div>;
}
