import { formatPrice, materialNames } from './catalog.js';
import { cartSubtotal } from './cart.js';
import { business } from '../data/legal.js';

export const getCatalogOrigin = (currentOrigin) =>
  (import.meta.env?.VITE_PUBLIC_SITE_URL?.trim() || currentOrigin).replace(/\/$/, '');

const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;

export function decodeProductCode(code) {
  if (!/^[A-Za-z0-9_-]{21}[AQgw]$/.test(code)) return null;
  const bytes = atob(code.replaceAll('-', '+').replaceAll('_', '/'));
  const hex = Array.from(bytes, byte => byte.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function productUrl(origin, id) {
  const base = origin.replace(/\/$/, '');
  if (!uuidPattern.test(id)) return `${base}/producto/${encodeURIComponent(id)}`;
  const bytes = id.replaceAll('-', '').match(/../g).map(pair => parseInt(pair, 16));
  const code = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  return `${base}/p/${code}`;
}

export const addCatalogLink = (message, origin) => {
  if (/^https?:\/\/\S+$/m.test(message)) return message;
  return `${message}\n\nVer catálogo de Alpez:\n${origin.replace(/\/$/, '')}/catalogo`;
};

export const generateCartMessage = (rows, origin = '') => [
  'Hola, quisiera pedir estas joyas:',
  ...rows.map(({ product, quantity }, index) => [
    `\n${index + 1}. ${product.name} · ${materialNames[product.material] || product.material}`,
    `Cantidad: ${quantity}`,
    `Precio por unidad: ${formatPrice(product.price)}${product.price > 0 ? ' COP' : ''}`,
    origin && `Ver producto en Alpez:\n${productUrl(origin, product.id)}`,
  ].filter(Boolean).join('\n')),
  `\nSubtotal de piezas con precio: ${cartSubtotal(rows) > 0 ? `${formatPrice(cartSubtotal(rows))} COP` : 'Por confirmar'}.`,
  rows.some(row => !(row.product.price > 0)) && 'Hay piezas con precio por confirmar.',
  '¿Me confirmas disponibilidad, total y opciones de entrega? El envío se acuerda por WhatsApp.',
].filter(Boolean).join('\n');

export const WHATSAPP_NUMBER = business.whatsappNumber;

export const buildWhatsAppLink = (message = '', number = WHATSAPP_NUMBER) => {
  const safeMessage = encodeURIComponent(message || 'Hola, quiero información sobre sus joyas.');
  return `https://wa.me/${number}?text=${safeMessage}`;
};

export const generateProductMessage = (product, origin = '') => {
  const productName = product?.name ?? 'pieza de joyería';
  const productMaterial = materialNames[product?.material] || product?.material || '';
  return [
    `Hola, me interesa ${productName}.`,
    productMaterial && `Material: ${productMaterial}.`,
    product?.price > 0 && `Precio del catálogo: ${formatPrice(product.price)} COP.`,
    origin && product?.id && `\nVer producto en Alpez:\n${productUrl(origin, product.id)}\n`,
    '¿Me confirmas disponibilidad y opciones de entrega para hacer mi compra?',
  ].filter(Boolean).join('\n');
};
