import { Link, useLocation } from 'react-router-dom';

export default function ShopNavLink({ to, className = '', children, ...props }) {
  const location = useLocation();
  const [path, query = ''] = to.split('?');
  const material = new URLSearchParams(query).get('material');
  const currentMaterial = new URLSearchParams(location.search).get('material');
  const active = location.pathname === path && (path !== '/catalogo' || material === currentMaterial);
  return <Link {...props} to={to} aria-current={active ? 'page' : undefined} className={`shop-nav-link ${active ? 'is-active' : ''} ${className}`}>{children}</Link>;
}
