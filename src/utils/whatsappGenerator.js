import { formatPrice, materialNames } from './catalog.js';
import { cartSubtotal } from './cart.js';
import { business } from '../data/legal.js';

export const getCatalogOrigin = (currentOrigin) =>
  (import.meta.env?.VITE_PUBLIC_SITE_URL?.trim() || currentOrigin).replace(/\/$/, '');

const productUrl = (origin, id) => `${origin.replace(/\/$/, '')}/producto/${encodeURIComponent(id)}`;

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
