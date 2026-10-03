import { formatPrice, materialNames } from './catalog.js';
import { cartSubtotal } from './cart.js';
import { business } from '../data/legal.js';

export const generateCartMessage = (rows, origin = '') => [
  'Hola, Alpez. Quisiera pedir estas joyas:',
  ...rows.map(({ product, quantity }, index) => [
    `\n${index + 1}. ${product.name} · ${materialNames[product.material] || product.material}`,
    `Cantidad: ${quantity}`,
    `Precio por unidad: ${formatPrice(product.price)}${product.price > 0 ? ' COP' : ''}`,
    origin && `${origin.replace(/\/$/, '')}/producto/${encodeURIComponent(product.id)}`,
  ].filter(Boolean).join('\n')),
  `\nSubtotal de piezas con precio: ${cartSubtotal(rows) > 0 ? `${formatPrice(cartSubtotal(rows))} COP` : 'Por confirmar'}.`,
  rows.some(row => !(row.product.price > 0)) && 'Hay piezas con precio por confirmar.',
  '¿Me confirmas disponibilidad, total y opciones de entrega? El envío se acuerda por WhatsApp.',
].filter(Boolean).join('\n');

export const WHATSAPP_NUMBER = business.whatsappNumber;

export const buildWhatsAppLink = (message = '') => {
  const safeMessage = encodeURIComponent(message || 'Hola, quiero información sobre sus joyas.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${safeMessage}`;
};

export const generateProductMessage = (product, origin = '') => {
  const productName = product?.name ?? 'pieza de joyería';
  const productMaterial = materialNames[product?.material] || product?.material || '';
  return [
    `Hola, Alpez. Me interesa ${productName}.`,
    productMaterial && `Material: ${productMaterial}.`,
    product?.price > 0 && `Precio del catálogo: ${formatPrice(product.price)} COP.`,
    origin && product?.id && `${origin.replace(/\/$/, '')}/producto/${encodeURIComponent(product.id)}`,
    '¿Me confirmas disponibilidad y opciones de entrega para hacer mi compra?',
  ].filter(Boolean).join('\n');
};
