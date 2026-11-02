import { useCallback, useId, useRef, useState } from 'react';
import { ArrowRight, Funnel } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { categories } from '../data/mockProducts';
import { filterProducts, materialNames, validatePriceRange, orderCategoriesByProductCount } from '../utils/catalog';

const emptyDraft = { material: '', category: '', min: '', max: '', sort: 'featured' };

export default function CatalogFilters({ filters, products, onApply, isLoading, error }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [submitted, setSubmitted] = useState(false);
  const triggerGesture = useRef(null);
  const priceMax = useRef(null);
  const errorId = useId();
  const dialogId = useId();
  const close = useCallback(() => setOpen(false), []);
  const rangeError = validatePriceRange(draft.min, draft.max);
  const orderedCategories = orderCategoriesByProductCount(categories, products, draft.material);
  const count = filterProducts(products, { ...draft, search: filters.search }).length;
  const active = Number(Boolean(filters.material)) + Number(Boolean(filters.category)) + Number(Boolean(filters.min || filters.max));
  const begin = () => { setDraft({ ...emptyDraft, ...filters }); setSubmitted(false); setOpen(true); };
  const submit = event => {
    event.preventDefault();
    setSubmitted(true);
    if (rangeError) { priceMax.current.focus(); return; }
    onApply({ material: draft.material, categoria: draft.category, min: draft.min, max: draft.max, orden: draft.sort, disponible: '' });
    close();
  };
  const select = (key, value) => setDraft(current => ({ ...current, [key]: value }));

  return <>
    <button type="button" className="catalog-filter-button" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? dialogId : undefined}
      onClick={() => { if (!triggerGesture.current?.opened) begin(); triggerGesture.current = null; }}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary || !window.matchMedia('(max-width: 767px)').matches) return;
        triggerGesture.current = { id: event.pointerId, y: event.clientY, opened: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const gesture = triggerGesture.current;
        if (gesture?.id !== event.pointerId || gesture.opened) return;
        if (gesture.y - event.clientY > 24) { gesture.opened = true; begin(); }
      }}
      onPointerCancel={() => { triggerGesture.current = null; }}>
      <Funnel size={18} aria-hidden="true" />Filtros{active > 0 && <span>({active})</span>}
    </button>
    <BottomSheet id={dialogId} open={open} onClose={close} title="Encuentra tu pieza" className="catalog-filter-sheet">
      <form onSubmit={submit} className="mobile-filter-form" noValidate>
        <div className="filter-sheet-body">
          <fieldset><legend>Material</legend><div className="filter-sheet-options">
            {Object.entries({ '': 'Todos', ...materialNames }).map(([value, label]) => <button key={value} type="button" aria-pressed={draft.material === value} onClick={() => select('material', value)}>{label}</button>)}
          </div></fieldset>
          <fieldset><legend>Tipo de joya</legend><div className="filter-sheet-options">
            {[{ key: '', label: 'Todas las piezas' }, ...orderedCategories].map(category => <button key={category.key} type="button" aria-pressed={draft.category === category.key} onClick={() => select('category', category.key)}>{category.label}</button>)}
          </div></fieldset>
          <fieldset><legend>Tu presupuesto · COP</legend><div className="filter-sheet-prices">
            <label>Desde<input type="number" min="0" step="any" inputMode="decimal" placeholder="Sin mínimo" value={draft.min} aria-invalid={Boolean(rangeError) && submitted} aria-describedby={rangeError && submitted ? errorId : undefined} onChange={event => select('min', event.target.value)} /></label>
            <label>Hasta<input ref={priceMax} type="number" min="0" step="any" inputMode="decimal" placeholder="Sin límite" value={draft.max} aria-invalid={Boolean(rangeError) && submitted} aria-describedby={rangeError && submitted ? errorId : undefined} onChange={event => select('max', event.target.value)} /></label>
          </div>{rangeError && submitted && <p id={errorId} role="alert" className="shop-form-error">{rangeError}</p>}</fieldset>
          <label className="filter-sheet-sort">Ordenar piezas<select value={draft.sort} onChange={event => select('sort', event.target.value)}><option value="featured">Destacadas</option><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select></label>
        </div>
        <footer className="filter-sheet-footer">
          <p role="status" aria-live="polite">{isLoading ? 'Cargando piezas…' : error ? 'El catálogo no está disponible.' : rangeError ? 'Revisa el rango de precios.' : `${count} ${count === 1 ? 'pieza coincide' : 'piezas coinciden'} con tu selección.`}</p>
          <div><button type="button" className="filter-sheet-reset" onClick={() => { setDraft(emptyDraft); setSubmitted(false); }}>Restablecer</button><button type="submit" className="filter-sheet-apply">Aplicar filtros <ArrowRight size={18} aria-hidden="true" /></button></div>
        </footer>
      </form>
    </BottomSheet>
  </>;
}
