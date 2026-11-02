import { useCallback, useEffect, useId, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import BottomSheet from './BottomSheet';

export default function AdminFilters({ children, className = '' }) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [open, setOpen] = useState(false);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const resize = () => { setMobile(query.matches); setOpen(false); };
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  if (!mobile) return <div className={`admin-filters ${className}`}>{children}</div>;
  return <div className="admin-mobile-filters">
    <button type="button" className="shop-button" aria-haspopup="dialog" aria-controls={id} aria-expanded={open} onClick={() => setOpen(true)}><SlidersHorizontal size={18} aria-hidden="true" />Buscar y filtrar</button>
    <BottomSheet id={id} open={open} onClose={close} title="Filtros de administración" closeLabel="Cerrar filtros" className="admin-bottom-sheet">
      <div className={`admin-filters admin-filter-sheet-body ${className}`}>{children}</div>
      <div className="admin-sheet-footer"><button type="button" className="shop-button" onClick={close}>Ver resultados</button></div>
    </BottomSheet>
  </div>;
}
