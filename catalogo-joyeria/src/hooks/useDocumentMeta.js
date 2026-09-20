import { useEffect } from 'react';

const SITE_NAME = 'Alpez Joyería';
const DEFAULT_DESCRIPTION =
  'Catálogo de joyería fina en oro 18k y oro laminado 18k. Piezas seleccionadas y asesoría personalizada por WhatsApp.';

const setMetaTag = (attribute, key, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * useDocumentMeta — actualiza <title>, meta description y Open Graph
 * cuando cambia de página. No requiere react-helmet ni nada extra.
 *
 * Uso:
 *   useDocumentMeta({
 *     title: `${product.name} · Alpez Joyería`,
 *     description: product.description,
 *     image: product.image,
 *   });
 */
const useDocumentMeta = ({ title, description = DEFAULT_DESCRIPTION, image } = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Oro 18k y Oro Laminado 18k`;
    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }
  }, [title, description, image]);
};

export default useDocumentMeta;