import { useMemo, useState } from 'react';
import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import JewelryCard from '../components/JewelryCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { categories, materialLabels } from '../data/mockProducts';

const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

// isLoading: true mientras App.jsx espera la respuesta de la API.
// Si tu App.jsx todavía no pasa esta prop, el catálogo funciona igual
// (isLoading queda en false por defecto) — solo no verás los skeletons.
const Catalog = ({ products, isLoading = false }) => {
  useDocumentMeta({
    title: 'Catálogo',
    description: 'Explora piezas en oro 18k y oro laminado 18k, filtra por categoría y encuentra tu joya ideal.',
  });
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const materialFilter = searchParams.get('material') || 'all';
  const categoryFilter = searchParams.get('categoria') || 'all';

  const filteredProducts = useMemo(() => {
    const minPrice = priceRange.min ? Number(priceRange.min) : null;
    const maxPrice = priceRange.max ? Number(priceRange.max) : null;
    const normalizedSearch = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesMaterial = materialFilter === 'all' || product.material === materialFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesAvailability = !onlyAvailable || (product.stock ?? 0) > 0;

      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      const name = typeof product.name === 'string' ? product.name.toLowerCase() : '';
      const description = typeof product.description === 'string' ? product.description.toLowerCase() : '';
      const matchesSearch = !normalizedSearch || name.includes(normalizedSearch) || description.includes(normalizedSearch);

      return (
        matchesMaterial &&
        matchesCategory &&
        matchesAvailability &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesSearch
      );
    });

    const sorted = [...result];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    }

    return sorted;
  }, [categoryFilter, materialFilter, onlyAvailable, priceRange, products, search, sortBy]);

  const hasActivePriceFilter = priceRange.min !== '' || priceRange.max !== '';
  const activeFilterCount =
    (materialFilter !== 'all' ? 1 : 0) +
    (categoryFilter !== 'all' ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (hasActivePriceFilter ? 1 : 0);

  const clearAdvancedFilters = () => {
    setOnlyAvailable(false);
    setPriceRange({ min: '', max: '' });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-8 rounded-card-lg border border-line bg-ivory-soft/90 px-5 py-6 shadow-[0_20px_45px_rgba(11,37,27,0.03)] backdrop-blur-sm sm:px-8 lg:mb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="luxury-eyebrow">Catálogo</p>
            <h1 className="mt-3 text-5xl font-medium tracking-[-0.04em] text-ink md:text-6xl">
              Colección exclusiva
            </h1>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por producto"
              className="w-full rounded-pill border border-line bg-stone py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
            />
          </div>
        </div>
      </header>

      {/* Chips de material y categoría */}
      <div className="mb-4 rounded-card border border-line bg-ivory-soft/90 p-4 shadow-[0_20px_45px_rgba(11,37,27,0.03)] backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-stone px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
            </span>

            <Link
              to="/catalogo"
              className={`rounded-pill px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] ${
                materialFilter === 'all' ? 'bg-forest-900 text-white shadow-md' : 'border border-line bg-white text-ink-soft'
              }`}
            >
              Todos
            </Link>

            <Link
              to="/catalogo?material=oro-18k"
              className={`rounded-pill px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] ${
                materialFilter === 'oro-18k' ? 'bg-forest-900 text-white shadow-md' : 'border border-line bg-white text-ink-soft'
              }`}
            >
              {materialLabels['oro-18k']}
            </Link>

            <Link
              to="/catalogo?material=laminado"
              className={`rounded-pill px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] ${
                materialFilter === 'laminado' ? 'bg-forest-900 text-white shadow-md' : 'border border-line bg-white text-ink-soft'
              }`}
            >
              {materialLabels.laminado}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <Link
                key={category.key}
                to={categoryFilter === category.key ? '/catalogo' : `/catalogo?categoria=${category.key}`}
                className={`rounded-pill px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] ${
                  categoryFilter === category.key ? 'bg-forest-800 text-white shadow-md' : 'border border-line bg-stone text-ink-soft'
                }`}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de orden + filtros avanzados (precio, disponibilidad) */}
      <div className="mb-8 rounded-card border border-line bg-ivory-soft/90 p-4 shadow-[0_20px_45px_rgba(11,37,27,0.03)] backdrop-blur-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((open) => !open)}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-soft"
          >
            Precio y disponibilidad
            {activeFilterCount > 0 && !showFilters && (
              <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[9px] font-semibold text-forest-900">
                {(onlyAvailable ? 1 : 0) + (hasActivePriceFilter ? 1 : 0)}
              </span>
            )}
          </button>

          <label className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <ArrowDownUp className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-pill border border-line bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-soft outline-none focus:border-gold-400"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-line pt-4">
            <div>
              <p className="mb-1.5 text-[9px] uppercase tracking-[0.18em] text-ink-faint">Precio mínimo</p>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={priceRange.min}
                onChange={(event) => setPriceRange((current) => ({ ...current, min: event.target.value }))}
                placeholder="$0"
                className="w-28 rounded-pill border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-gold-400"
              />
            </div>
            <div>
              <p className="mb-1.5 text-[9px] uppercase tracking-[0.18em] text-ink-faint">Precio máximo</p>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={priceRange.max}
                onChange={(event) => setPriceRange((current) => ({ ...current, max: event.target.value }))}
                placeholder="Sin límite"
                className="w-28 rounded-pill border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-gold-400"
              />
            </div>

            <label className="mb-1 flex items-center gap-2 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) => setOnlyAvailable(event.target.checked)}
                className="h-4 w-4 rounded border-line-strong text-gold-500 focus:ring-gold-400"
              />
              Solo piezas disponibles
            </label>

            {(hasActivePriceFilter || onlyAvailable) && (
              <button
                type="button"
                onClick={clearAdvancedFilters}
                className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-ink-faint transition hover:text-ink-soft"
              >
                <X className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-8 flex items-center justify-between gap-3 text-sm text-ink-muted">
        <p>
          Mostrando <span className="font-semibold text-ink">{filteredProducts.length}</span> piezas
        </p>
      </div>

      {isLoading ? (
        <section className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </section>
      ) : filteredProducts.length > 0 ? (
        <section className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <JewelryCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <div className="rounded-card-lg border border-dashed border-sand-strong bg-ivory-soft/90 px-6 py-16 text-center shadow-[0_20px_45px_rgba(11,37,27,0.02)]">
          <p className="text-lg font-medium text-ink">
            {products.length === 0
              ? 'Todavía no hay productos cargados desde el backend.'
              : 'No encontramos piezas con esos filtros.'}
          </p>
          <Link to="/catalogo" className="mt-4 inline-block text-sm uppercase tracking-[0.22em] text-ink-soft">
            Reiniciar búsqueda
          </Link>
        </div>
      )}
    </main>
  );
};

export default Catalog;
