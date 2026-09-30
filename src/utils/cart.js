export const CART_KEY = 'alpez-cart-v1';

export function parseCart(raw) {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    return value.filter(item => {
      if (!item || typeof item.id !== 'string' || !item.id || seen.has(item.id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return false;
      seen.add(item.id);
      return true;
    }).slice(0, 100).map(({ id, quantity }) => ({ id, quantity: Math.min(quantity, 99) }));
  } catch { return []; }
}

export function stockLimit(product) { return product ? 99 : 0; }

export function resolveCart(items, products) {
  return items.map(item => {
    const product = products.find(product => String(product.id) === item.id);
    const limit = stockLimit(product);
    const issue = !product ? 'Esta pieza ya no está disponible en el catálogo.'

        : item.quantity > limit ? `El límite por pieza en el carrito es ${limit}.` : '';
    return { ...item, product, limit, issue };
  });
}

export const cartSubtotal = rows => rows.reduce((sum, row) => sum + (Number(row.product?.price) > 0 ? Number(row.product.price) * row.quantity : 0), 0);
