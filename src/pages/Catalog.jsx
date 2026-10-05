import { WhatsAppIcon } from '../components/SocialIcon';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Funnel, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import JewelryCard from '../components/JewelryCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Modal from '../components/Modal';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { categories } from '../data/mockProducts';
import { filterProducts, materialNames, readCollectionFilters, resetCollectionFilters, validatePriceRange, formatPrice } from '../utils/catalog';
import { buildWhatsAppLink } from '../utils/whatsappGenerator';

export default function Catalog({ products, isLoading = false, error = '', isSearching = false }) {
  useEffect(() => {
    if (isSearching) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isSearching]);
  useDocumentMeta({ title: 'Catálogo', description: 'Descubre joyas en oro 18k y oro laminado. Elige tu pieza y recibe asesoría para comprar por WhatsApp.' });
  const [params, setParams] = useSearchParams();
  const filters = readCollectionFilters(params);
  useEffect(() => {
    if (params.get('material') === filters.material) return;
    setParams(current => {
      const next = new URLSearchParams(current);
      next.set('material', filters.material);
      return next;
    }, { replace: true });
  }, [params, setParams, filters.material]);
  const [showFilters, setShowFilters] = useState(false);
  const [draft, setDraft] = useState({ min: '', max: '' });
  const [draftError, setDraftError] = useState('');
  const categoryScroll = useRef(null);
  const filtered = useMemo(() => filterProducts(products, readCollectionFilters(params)), [products, params]);
  const advancedCount = Number(Boolean(filters.min || filters.max));
  const hasFilters = Boolean(filters.category || filters.search || advancedCount);
  const rangeError = validatePriceRange(filters.min, filters.max);
  const update = (changes, replace = false) => setParams(current => {
    const next = new URLSearchParams(current);
    Object.entries(changes).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    return next;
  }, { replace });
  const reset = () => setParams(resetCollectionFilters(params));
  const openFilters = () => { setDraft({ min: filters.min, max: filters.max }); setDraftError(''); setShowFilters(true); };
  const applyFilters = event => {
    event.preventDefault();
    const message = validatePriceRange(draft.min, draft.max);
    if (message) { setDraftError(message); return; }
    update({ min: draft.min, max: draft.max, disponible: '' });
    setShowFilters(false);
  };
  const materialPicker = <fieldset className="catalog-material-filter"><legend className="sr-only">Elige el material de tu prenda</legend><div className="catalog-materials">{Object.entries(materialNames).map(([value, label]) => <button key={value} type="button" data-material={value} aria-pressed={filters.material === value} onClick={() => update({ material: value })}><Check size={16} aria-hidden="true" /><span>{label}</span></button>)}</div></fieldset>;
  return (
    <div className="catalog-page shop-shell">
      {isSearching && <h1 className="sr-only">Buscar joyas</h1>}
      {!isSearching && <>
      <header className="catalog-intro catalog-material-intro">
        <div><p className="shop-eyebrow">NUESTRA COLECCIÓN</p><h1>¿Qué material buscas para tu prenda?</h1></div>
        {materialPicker}
      </header>
      </>}

      {isSearching && <div className="catalog-search-row">{materialPicker}</div>}
      <nav className="catalog-category-navigation" aria-label="Filtrar prendas por categoría">
        <button type="button" className="catalog-category-scroll" aria-label="Desplazar categorías a la izquierda" onClick={() => categoryScroll.current?.scrollBy({ left: -220, behavior: 'smooth' })}><ChevronLeft size={16} /></button>
        <div ref={categoryScroll} className="catalog-categories" role="group" aria-label="Categoría" onKeyDown={event => {
          const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (!direction) return;
          const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
          const target = buttons[buttons.indexOf(document.activeElement) + direction];
          if (target) { event.preventDefault(); target.focus(); target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }
        }}>
          <button type="button" aria-pressed={!filters.category} onClick={() => update({ categoria: '' })}>Todas las piezas</button>
          {categories.map(category => <button type="button" key={category.key} aria-pressed={filters.category === category.key} onClick={() => update({ categoria: category.key })}>{category.label}</button>)}
        </div>
        <button type="button" className="catalog-category-scroll" aria-label="Desplazar categorías a la derecha" onClick={() => categoryScroll.current?.scrollBy({ left: 220, behavior: 'smooth' })}><ChevronRight size={16} /></button>
      </nav>

      <section className="catalog-controls" aria-label="Buscar y filtrar joyas">
        <div className="catalog-toolbar"><p role="status" aria-live="polite">{isLoading ? 'Buscando tus próximas favoritas…' : error ? 'Catálogo no disponible' : `${filtered.length} ${filtered.length === 1 ? 'pieza' : 'piezas'}`}</p><div className="catalog-toolbar-actions"><button type="button" className="catalog-filter-button" onClick={openFilters}><Funnel size={14} aria-hidden="true" />Filtros {advancedCount > 0 && <span>({advancedCount})</span>}</button><label className="catalog-sort"><span className="sr-only">Ordenar piezas</span><select value={filters.sort} onChange={event => update({ orden: event.target.value })}><option value="featured">Destacadas</option><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select><ChevronDown size={14} aria-hidden="true" /></label></div></div>
        {hasFilters && <div className="catalog-active-filters" aria-label="Filtros aplicados">
          {filters.search && <button onClick={() => update({ q: '' })}>“{filters.search}” <X size={13} /><span className="sr-only">Quitar búsqueda</span></button>}
          {filters.category && <button onClick={() => update({ categoria: '' })}>{categories.find(item => item.key === filters.category)?.label || filters.category}<X size={13} /><span className="sr-only">Quitar categoría</span></button>}
          {(filters.min || filters.max) && <button onClick={() => update({ min: '', max: '' })}>{rangeError ? 'Revisar precio' : `${filters.min ? formatPrice(filters.min) : '$0'} – ${filters.max ? formatPrice(filters.max) : 'sin límite'}`}<X size={13} /><span className="sr-only">Quitar precio</span></button>}
          <button className="catalog-reset" onClick={reset}>Limpiar filtros</button>
        </div>}
        {rangeError && <p role="alert" className="shop-form-error">{rangeError} Abre Filtros para corregirlo.</p>}
      </section>

      {isLoading ? <section aria-label="Cargando catálogo" aria-busy="true" className="shop-product-grid">{Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}</section> : error ? null : filtered.length ? <section className="shop-product-grid" aria-label="Piezas del catálogo">{filtered.map((product, index) => <JewelryCard key={product.id} product={product} eager={index < 2} />)}</section> : <section className="catalog-empty"><Search size={30} strokeWidth={1} /><h2>{products.length ? 'Tu joya aún te espera' : 'Estamos preparando la colección'}</h2><p>{products.length ? 'Prueba otra palabra o ajusta los filtros para descubrir más piezas.' : 'Escríbenos y te ayudamos a encontrar una pieza para ti.'}</p>{hasFilters && <button className="shop-button" onClick={reset}>Ver todas las piezas</button>}<a className="shop-text-link" target="_blank" rel="noopener noreferrer" href={buildWhatsAppLink('Hola, quiero ayuda para encontrar una joya.')}><WhatsAppIcon size={17} />Pedir asesoría</a></section>}

      <aside className="catalog-concierge"><div className="concierge-icon"><WhatsAppIcon size={24} strokeWidth={1.3} /></div><div><p className="shop-eyebrow">UNA ELECCIÓN PERSONAL</p><h2>¿Te ayudamos a elegir?</h2><p>Cuéntanos qué buscas. Te acompañamos a encontrar la pieza y coordinamos tu compra por WhatsApp.</p></div><a className="shop-button shop-button-light" href={buildWhatsAppLink('Hola, Alpez. Quiero ayuda para elegir una joya.')} target="_blank" rel="noopener noreferrer">Conversemos <ArrowRight size={17} /></a></aside>

      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Encuentra tu pieza">
        <form onSubmit={applyFilters} className="catalog-filter-form"><p>Afina tu búsqueda por precio.</p><fieldset><legend>Tu presupuesto · COP</legend><div className="catalog-price-inputs"><label>Desde<input type="number" min="0" step="any" inputMode="decimal" placeholder="0" value={draft.min} onChange={event => { setDraft(current => ({ ...current, min: event.target.value })); setDraftError(''); }} /></label><label>Hasta<input type="number" min="0" step="any" inputMode="decimal" placeholder="Sin límite" value={draft.max} onChange={event => { setDraft(current => ({ ...current, max: event.target.value })); setDraftError(''); }} /></label></div></fieldset>{draftError && <p className="shop-form-error" role="alert">{draftError}</p>}<div className="catalog-filter-footer"><button type="button" className="shop-text-link" onClick={() => { setDraft({ min: '', max: '' }); setDraftError(''); }}>Restablecer</button><button type="submit" className="shop-button">Aplicar filtros <ArrowRight size={16} /></button></div></form>
      </Modal>
    </div>
  );
}
