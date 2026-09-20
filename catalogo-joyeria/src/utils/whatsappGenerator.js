export const WHATSAPP_NUMBER = '573105758222';

export const buildWhatsAppLink = (message = '') => {
  const safeMessage = encodeURIComponent(message || 'Hola, quiero información sobre sus joyas.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${safeMessage}`;
};

export const generateProductMessage = (product) => {
  const productName = product?.name ?? 'pieza de joyería';
  const productMaterial = product?.material ? product.material.replace('-', ' ') : 'oro';

  return `Hola, me interesa el producto ${productName}. Quisiera más información sobre la pieza en ${productMaterial}.`;
};
