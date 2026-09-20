import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, [open]);
  return <dialog ref={ref} className={`shop-dialog ${className}`} aria-label={title} onCancel={onClose} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="shop-dialog-content">
      <div className="shop-dialog-header"><h2>{title}</h2><button type="button" onClick={onClose} className="shop-icon-button" aria-label="Cerrar ventana"><X size={22} /></button></div>
      {open && children}
    </div>
  </dialog>;
}
