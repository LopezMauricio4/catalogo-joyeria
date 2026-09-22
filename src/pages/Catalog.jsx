import { WhatsAppIcon } from '../components/SocialIcon';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import JewelryCard from '../components/JewelryCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Modal from '../components/Modal';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { categories } from '../data/mockProducts';
import { filterProducts, materialNames, readCatalogFilters, validatePriceRange, formatPrice } from '../utils/catalog';
import { buildWhatsAppLink } from '../utils/whatsappGenerator';

export default function Catalog({ products, isLoading = false, error = '', isSearching = false }) {
  useEffect(() => {
    if (isSearching) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isSearching]);
  useDocumentMeta({ title: 'Catálogo', description: 'Descubre joyas en oro 18k y oro laminado. Elige tu pieza y recibe asesoría para comprar por WhatsApp.' });
  const [params, setParams] = useSearchParams();
  const filters = readCatalogFilters(params);
  const [showFilters, setShowFilters] = useState(false);
  const [draft, setDraft] = useState({ min: '', max: '', available: false });
  const [draftError, setDraftError] = useState('');
  const filtered = useMemo(() => filterProducts(products, readCatalogFilters(params)), [products, params]);
  const advancedCount = Number(filters.available) + Number(Boolean(filters.min || filters.max));
  const hasFilters = Boolean(filters.material || filters.category || filters.search || advancedCount);
  const rangeError = validatePriceRange(filters.min, filters.max);
  const update = (changes, replace = false) => setParams(current => {
    const next = new URLSearchParams(current);
    Object.entries(changes).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    return next;
  }, { replace });
  const reset = () => setParams({});
  const openFilters = () => { setDraft({ min: filters.min, max: filters.max, available: filters.available }); setDraftError(''); setShowFilters(true); };
  const applyFilters = event => {
    event.preventDefault();
    const message = validatePriceRange(draft.min, draft.max);
    if (message) { setDraftError(message); return; }
    update({ min: draft.min, max: draft.max, disponible: draft.available ? '1' : '' });
    setShowFilters(false);
  };
  return (
    <div className="catalog-page shop-shell">
      {isSearching && <h1 className="sr-only">Buscar joyas</h1>}
      {!isSearching && <>
      <div className="catalog-category-row catalog-category-row-sticky">
        <div className="catalog-categories" aria-label="Categoría">
          <button type="button" aria-pressed={!filters.category} onClick={() => update({ categoria: '' })}>Todas las piezas</button>
          {categories.map(category => <button type="button" key={category.key} aria-pressed={filters.category === category.key} onClick={() => update({ categoria: category.key })}>{category.label}</button>)}
        </div>
      </div>

      <header className="catalog-intro">
        <div><p className="shop-eyebrow">NUESTRA COLECCIÓN</p><h1>Descubre nuestras piezas</h1></div>
        <div className="catalog-intro-copy"><p>Aquí podrás descubrir todas nuestras prendas disponibles.</p><a href={buildWhatsAppLink('Hola, Alpez. Me gustaría recibir asesoría para elegir una joya.')} target="_blank" rel="noopener noreferrer">Te asesoramos por WhatsApp <ArrowRight size={16} /></a></div>
      </header>
      </>}

      <section className="catalog-controls" aria-label="Buscar y filtrar joyas">
        <div className="catalog-search-row">
          <fieldset className="catalog-material-filter"><legend>Elige el material</legend><div className="catalog-materials">{[['', 'Ver todo'], ...Object.entries(materialNames)].map(([value, label]) => <button key={value} type="button" data-material={value || 'all'} aria-pressed={filters.material === value} onClick={() => update({ material: value })}><Check size={14} aria-hidden="true" /><span>{label}</span></button>)}</div></fieldset>
        </div>
        <div className="catalog-toolbar"><p role="status" aria-live="polite">{isLoading ? 'Buscando tus próximas favoritas…' : error ? 'Catálogo no disponible' : `${filtered.length} ${filtered.length === 1 ? 'pieza' : 'piezas'}`}</p><div className="catalog-toolbar-actions"><button type="button" className="catalog-filter-button" onClick={openFilters}><SlidersHorizontal size={16} />Filtros {advancedCount > 0 && <span>{advancedCount}</span>}</button><label className="catalog-sort"><span className="sr-only">Ordenar piezas</span><select value={filters.sort} onChange={event => update({ orden: event.target.value })}><option value="featured">Destacadas</option><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select></label></div></div>
        {hasFilters && <div className="catalog-active-filters" aria-label="Filtros aplicados">
          {filters.search && <button onClick={() => update({ q: '' })}>“{filters.search}” <X size={13} /><span className="sr-only">Quitar búsqueda</span></button>}
          {filters.material && <button onClick={() => update({ material: '' })}>{materialNames[filters.material] || filters.material}<X size={13} /><span className="sr-only">Quitar material</span></button>}
          {filters.category && <button onClick={() => update({ categoria: '' })}>{categories.find(item => item.key === filters.category)?.label || filters.category}<X size={13} /><span className="sr-only">Quitar categoría</span></button>}
          {(filters.min || filters.max) && <button onClick={() => update({ min: '', max: '' })}>{rangeError ? 'Revisar precio' : `${filters.min ? formatPrice(filters.min) : '$0'} – ${filters.max ? formatPrice(filters.max) : 'sin límite'}`}<X size={13} /><span className="sr-only">Quitar precio</span></button>}
          {filters.available && <button onClick={() => update({ disponible: '' })}>Disponibles<X size={13} /><span className="sr-only">Quitar disponibilidad</span></button>}
          <button className="catalog-reset" onClick={reset}>Limpiar todo</button>
        </div>}
        {rangeError && <p role="alert" className="shop-form-error">{rangeError} Abre Filtros para corregirlo.</p>}
      </section>

      {isLoading ? <section aria-label="Cargando catálogo" aria-busy="true" className="shop-product-grid">{Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}</section> : error ? null : filtered.length ? <section className="shop-product-grid" aria-label="Piezas del catálogo">{filtered.map((product, index) => <JewelryCard key={product.id} product={product} eager={index < 2} />)}</section> : <section className="catalog-empty"><Search size={30} strokeWidth={1} /><h2>{products.length ? 'Tu joya aún te espera' : 'Estamos preparando la colección'}</h2><p>{products.length ? 'Prueba otra palabra o ajusta los filtros para descubrir más piezas.' : 'Escríbenos y te ayudamos a encontrar una pieza para ti.'}</p>{hasFilters && <button className="shop-button" onClick={reset}>Ver todas las piezas</button>}<a className="shop-text-link" target="_blank" rel="noopener noreferrer" href={buildWhatsAppLink('Hola, quiero ayuda para encontrar una joya.')}><WhatsAppIcon size={17} />Pedir asesoría</a></section>}

      <aside className="catalog-concierge"><div className="concierge-icon"><WhatsAppIcon size={24} strokeWidth={1.3} /></div><div><p className="shop-eyebrow">UNA ELECCIÓN PERSONAL</p><h2>¿Te ayudamos a elegir?</h2><p>Cuéntanos qué buscas. Te acompañamos a encontrar la pieza y coordinamos tu compra por WhatsApp.</p></div><a className="shop-button shop-button-light" href={buildWhatsAppLink('Hola, Alpez. Quiero ayuda para elegir una joya.')} target="_blank" rel="noopener noreferrer">Conversemos <ArrowRight size={17} /></a></aside>

      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Encuentra tu pieza">
        <form onSubmit={applyFilters} className="catalog-filter-form"><p>Afina tu búsqueda por precio y disponibilidad.</p><fieldset><legend>Tu presupuesto · COP</legend><div className="catalog-price-inputs"><label>Desde<input type="number" min="0" step="any" inputMode="decimal" placeholder="0" value={draft.min} onChange={event => { setDraft(current => ({ ...current, min: event.target.value })); setDraftError(''); }} /></label><label>Hasta<input type="number" min="0" step="any" inputMode="decimal" placeholder="Sin límite" value={draft.max} onChange={event => { setDraft(current => ({ ...current, max: event.target.value })); setDraftError(''); }} /></label></div></fieldset><label className="catalog-available"><input type="checkbox" checked={draft.available} onChange={event => setDraft(current => ({ ...current, available: event.target.checked }))} /><span>Solo piezas disponibles</span></label>{draftError && <p className="shop-form-error" role="alert">{draftError}</p>}<div className="catalog-filter-footer"><button type="button" className="shop-text-link" onClick={() => { setDraft({ min: '', max: '', available: false }); setDraftError(''); }}>Restablecer</button><button type="submit" className="shop-button">Aplicar filtros <ArrowRight size={16} /></button></div></form>
      </Modal>
    </div>
  );
}
