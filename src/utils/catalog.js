export const materialNames = { 'oro-18k': 'Oro 18k', laminado: 'Oro laminado 18k' };
const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const formatPrice = (price) => Number.isFinite(Number(price)) && Number(price) > 0 ? money.format(Number(price)) : 'Consultar precio';
export const normalizeText = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const readCatalogFilters = (params) => ({
  material: params.get('material') || '', category: params.get('categoria') || '',
  search: params.get('q') || '', sort: params.get('orden') || 'featured',
  min: params.get('min') || '', max: params.get('max') || '',
});
export const readCollectionFilters = params => {
  const filters = readCatalogFilters(params);
  return { ...filters, material: Object.hasOwn(materialNames, filters.material) ? filters.material : '' };
};
export const resetCollectionFilters = params => {
  const { material } = readCollectionFilters(params);
  return new URLSearchParams(material ? { material } : {});
};
export const catalogSearchParams = query => new URLSearchParams(query ? { q: query } : {});
export const orderCategoriesByProductCount = (categories, products, material = '') => {
  const counts = new Map();
  for (const product of products) {
    if (material && product.material !== material) continue;
    counts.set(product.category, (counts.get(product.category) || 0) + 1);
  }
  // A copy keeps the shared category list intact; ties retain its original order.
  return [...categories].sort((a, b) => (counts.get(b.key) || 0) - (counts.get(a.key) || 0));
};
// Categories shown as filters: only those with pieces in the current material, keeping the
// selected one visible so an old link never hides the active filter.
export const categoriesWithProducts = (categories, products, material = '', selected = '') => {
  const present = new Set(products.filter(product => !material || product.material === material).map(product => product.category));
  return orderCategoriesByProductCount(categories, products, material).filter(category => present.has(category.key) || category.key === selected);
};
export const validatePriceRange = (min, max) => {
  if ([min, max].some(value => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0))) return 'Escribe precios válidos, iguales o mayores a cero.';
  if (min !== '' && max !== '' && Number(min) > Number(max)) return 'El precio máximo debe ser mayor o igual al mínimo.';
  return '';
};
export const filterProducts = (products, filters) => {
  const rangeError = validatePriceRange(filters.min, filters.max);
  const search = normalizeText(filters.search);
  const result = products.filter(product =>
    (!filters.material || product.material === filters.material) &&
    (!filters.category || product.category === filters.category) &&

    (rangeError || filters.min === '' || Number(product.price) >= Number(filters.min)) &&
    (rangeError || filters.max === '' || Number(product.price) <= Number(filters.max)) &&
    (!search || normalizeText(`${product.name} ${product.description} ${materialNames[product.material] || ''} ${product.category}`).includes(search))
  );
  return result.sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price;
    if (filters.sort === 'price-desc') return b.price - a.price;
    if (filters.sort === 'newest') return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
};

// A short, readable reference for customers and support ("A1B2C3D4"); the full id stays internal.
export const productReference = id => String(id ?? '').replaceAll('-', '').slice(0, 8).toUpperCase();
// Related pieces: same kind of jewel first, then same material; never the piece itself.
export const relatedPieces = (product, products, limit = 4) => {
  const score = item => (item.category === product.category ? 2 : 0) + (item.material === product.material ? 1 : 0);
  return products
    .filter(item => item.id !== product.id && score(item) > 0)
    .map((item, position) => ({ item, position, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .slice(0, limit)
    .map(entry => entry.item);
};
