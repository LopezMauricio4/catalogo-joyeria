import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { catalogSearchParams } from '../utils/catalog';

export default function HeaderSearch({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [search, setSearch] = useState({ value: query, fromUrl: query });
  if (search.fromUrl !== query) setSearch({ value: query, fromUrl: query });
  useEffect(() => {
    if (search.value === query) return;
    // Keep typing immediate while updating the results after a brief pause.
    const timer = window.setTimeout(() => navigate({ pathname: '/catalogo', search: catalogSearchParams(search.value).toString() }, { replace: true, preventScrollReset: true }), 200);
    return () => window.clearTimeout(timer);
  }, [search.value, query, navigate]);
  return <form id="header-search" className="header-search-form" role="search" onSubmit={event => event.preventDefault()} onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <div className="header-search-field">
      <Search size={19} aria-hidden="true" />
      <input autoFocus aria-label="Buscar joyas en todo el catálogo" type="search" placeholder="Buscar en todo el catálogo…" value={search.value} onChange={event => setSearch({ value: event.target.value, fromUrl: query })} enterKeyHint="search" />
    </div>
    <button type="button" className="shop-icon-button" aria-label="Cerrar búsqueda" onClick={onClose}><X size={20} /></button>
  </form>;
}
