import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function HeaderSearch({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  const updateSearch = value => {
    const params = new URLSearchParams(location.pathname === '/catalogo' ? location.search : '');
    if (value) params.set('q', value);
    else params.delete('q');
    navigate({ pathname: '/catalogo', search: params.toString() }, { replace: true, preventScrollReset: true });
  };
  return <form id="header-search" className="header-search-form" role="search" onSubmit={event => event.preventDefault()} onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <div className="header-search-field">
      <Search size={19} aria-hidden="true" />
      <input autoFocus aria-label="Buscar joyas en el catálogo" type="search" placeholder="Busca esa pieza especial…" value={query} onChange={event => updateSearch(event.target.value)} enterKeyHint="search" />
    </div>
    <button type="button" className="shop-icon-button" aria-label="Cerrar búsqueda" onClick={onClose}><X size={20} /></button>
  </form>;
}
