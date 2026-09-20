export const materialNames = { 'oro-18k': 'Oro 18k', laminado: 'Oro laminado 18k' };
const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const formatPrice = (price) => Number.isFinite(Number(price)) && Number(price) > 0 ? money.format(Number(price)) : 'Consultar precio';
export const normalizeText = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const isSoldOut = (product) => product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;
export const readCatalogFilters = (params) => ({
  material: params.get('material') || '', category: params.get('categoria') || '',
  search: params.get('q') || '', sort: params.get('orden') || 'featured',
  min: params.get('min') || '', max: params.get('max') || '', available: params.get('disponible') === '1',
});
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
    (!filters.available || Number(product.stock) > 0) &&
    (rangeError || filters.min === '' || Number(product.price) >= Number(filters.min)) &&
    (rangeError || filters.max === '' || Number(product.price) <= Number(filters.max)) &&
    (!search || normalizeText(`${product.name} ${product.description} ${materialNames[product.material] || ''} ${product.category}`).includes(search))
  );
  return result.sort((a, b) => {
    if (filters.sort === 'price-asc') return a.price - b.price;
    if (filters.sort === 'price-desc') return b.price - a.price;
    if (filters.sort === 'newest') return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
    return Number(isSoldOut(a)) - Number(isSoldOut(b)) || Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
};
