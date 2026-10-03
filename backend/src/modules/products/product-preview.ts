import type { Request, Response } from 'express';

type PreviewProduct = { id: string; name: string; description: string | null; material: string; price: unknown; image: string | null; images: string[]; visible: boolean };
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export function renderProductPreview(template: string, product: PreviewProduct, url: string) {
  const title = `${product.name} · Alpez Joyería`;
  const material = product.material === 'oro-18k' ? 'Oro 18k' : 'Oro laminado 18k';
  const price = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(Number(product.price));
  const description = `${material} · ${price} COP. ${product.description || 'Descubre esta prenda en nuestro catálogo.'}`.slice(0, 300);
  const image = product.image || product.images[0];
  const meta = (attribute: string, key: string, content: string) => `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  const tags = [
    meta('name', 'description', description), meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'Alpez Joyería'), meta('property', 'og:locale', 'es_CO'),
    meta('property', 'og:title', title), meta('property', 'og:description', description), meta('property', 'og:url', url),
    meta('name', 'twitter:card', 'summary_large_image'), meta('name', 'twitter:title', title), meta('name', 'twitter:description', description),
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
  ];
  if (image) {
    const imageUrl = new URL(image, url);
    if (['https:', 'http:'].includes(imageUrl.protocol)) tags.push(meta('property', 'og:image', imageUrl.href), meta('property', 'og:image:alt', product.name), meta('name', 'twitter:image', imageUrl.href));
  }
  return template
    .replace(/<title>.*?<\/title>/is, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\b(?=[^>]*(?:name|property)\s*=\s*["'](?:description|og:[^"']*|twitter:[^"']*)["'])[^>]*>/gis, '')
    .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gis, '')
    .replace('</head>', () => `${tags.join('\n')}\n</head>`);
}

export function createProductPreview(dependencies: {
  findProduct: (id: string) => Promise<PreviewProduct | null>;
  readTemplate: () => Promise<string>;
}) {
  return async (req: Request, res: Response) => {
    const product = await dependencies.findProduct(String(req.params.id));
    const template = await dependencies.readTemplate();
    res.set('Cache-Control', 'no-store');
    if (!product?.visible) { res.status(404).type('html').send(template); return; }
    const protocol = req.get('x-forwarded-proto') === 'https' || req.secure ? 'https' : req.protocol;
    const url = `${protocol}://${req.get('host')}/producto/${encodeURIComponent(product.id)}`;
    res.type('html').send(renderProductPreview(template, product, url));
  };
}
