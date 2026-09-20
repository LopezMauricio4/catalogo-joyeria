import { useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, X, ZoomIn } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import JewelryCard from '../components/JewelryCard';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { materialLabels } from '../data/mockProducts';
import { buildWhatsAppLink, generateProductMessage } from '../utils/whatsappGenerator';

const ProductDetail = ({ products }) => {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Título, descripción e imagen dinámicos — para que compartir el link
  // por WhatsApp muestre la pieza correcta, no el genérico del sitio.
  useDocumentMeta({
    title: product?.name,
    description: product?.description,
    image: product?.image,
  });

  const productImages = useMemo(() => {
    const images = Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

    return images.filter(Boolean);
  }, [product]);

  // Productos relacionados: misma categoría o mismo material, excluyendo el actual
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (item) =>
          item.id !== product.id &&
          (item.category === product.category || item.material === product.material)
      )
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <p className="luxury-eyebrow">Producto no encontrado</p>
        <h1 className="mt-4 text-5xl font-medium text-ink">Esta pieza no está disponible</h1>
        <Link to="/catalogo" className="luxury-btn luxury-btn-secondary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const whatsappLink = buildWhatsAppLink(generateProductMessage(product));
  const currentImage = productImages[selectedImageIndex] || product.image;
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;

  // Ficha técnica — solo se muestran los campos que el producto realmente trae.
  // Si tu backend aún no guarda peso/dimensiones/SKU/garantía, esta sección
  // se ajusta sola (no revienta, solo omite lo que falta).
  const specItems = [
    { label: 'SKU', value: product.sku },
    { label: 'Peso', value: product.weight },
    { label: 'Dimensiones', value: product.dimensions },
    { label: 'Garantía', value: product.warranty },
    { label: 'Cuidados', value: product.careInstructions },
    { label: 'Tiempo de entrega', value: product.deliveryTime },
  ].filter((item) => Boolean(item.value));

  const goToPreviousImage = () => {
    setSelectedImageIndex((current) => (current === 0 ? productImages.length - 1 : current - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((current) => (current === productImages.length - 1 ? 0 : current + 1));
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:py-16 lg:pb-16">
      <Link to="/catalogo" className="mb-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-soft lg:mb-8">
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="space-y-3 lg:space-y-4">
          <div className="relative overflow-hidden rounded-card border border-line bg-white shadow-[0_24px_50px_rgba(11,37,27,0.06)] sm:rounded-card-lg">
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="group relative block w-full"
              aria-label="Ampliar imagen"
            >
              <img
                src={currentImage}
                alt={product.name}
                className={`h-[360px] w-full object-cover sm:h-[440px] lg:h-[560px] ${outOfStock ? 'grayscale' : ''}`}
              />
              <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink-soft opacity-0 shadow-md backdrop-blur-sm transition group-hover:opacity-100 sm:bottom-4 sm:right-4">
                <ZoomIn className="h-4 w-4" />
              </span>
            </button>

            {outOfStock && (
              <span className="absolute left-4 top-4 rounded-full bg-forest-900 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white">
                Agotado
              </span>
            )}

            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-ink-soft shadow-md backdrop-blur-sm transition hover:bg-white sm:left-4 sm:h-11 sm:w-11"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNextImage}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/80 text-ink-soft shadow-md backdrop-blur-sm transition hover:bg-white sm:right-4 sm:h-11 sm:w-11"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {productImages.map((image, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-2xl border transition sm:rounded-[1.2rem] ${
                    selectedImageIndex === index ? 'border-forest-900 shadow-sm' : 'border-line'
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="h-16 w-full object-cover sm:h-20" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="luxury-eyebrow">{materialLabels[product.material]}</p>
              {product.featured && (
                <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-forest-900">
                  Destacado
                </span>
              )}
            </div>
            <h1 className="text-[2.2rem] font-medium leading-[0.9] tracking-[-0.04em] text-ink sm:text-[3rem] lg:text-6xl">
              {product.name}
            </h1>
          </div>

          <div className="rounded-card border border-line bg-white p-4 shadow-[0_20px_35px_rgba(11,37,27,0.03)] sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-ink-faint">Precio</p>
                <p className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                  ${product.price.toLocaleString('es-MX')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Stock</p>
                <p className={`mt-2 text-sm font-medium sm:text-base ${outOfStock ? 'text-ink-faint' : 'text-forest-700'}`}>
                  {outOfStock ? 'Sin stock' : `${product.stock} disponible${product.stock > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">{product.description}</p>

          {product.features?.length > 0 && (
            <div className="space-y-3 rounded-card border border-sand-strong/60 bg-stone p-4">
              {product.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-forest-700 sm:text-base">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage text-ink-soft">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Ficha técnica — aparece solo si hay datos que mostrar */}
          {specItems.length > 0 && (
            <div className="rounded-card border border-line bg-white p-4 sm:p-5">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-ink-faint">Detalles de la pieza</p>
              <dl className="divide-y divide-line">
                {specItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-ink-faint">{item.label}</dt>
                    <dd className="text-right font-medium text-ink-soft">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="hidden flex-col gap-3 sm:flex-row lg:flex">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="luxury-btn luxury-btn-primary">
              Consultar por WhatsApp
            </a>
            <Link to="/catalogo" className="luxury-btn luxury-btn-secondary">
              Seguir viendo
            </Link>
          </div>

          <div className="flex items-center gap-3 rounded-card border border-sage bg-sage/40 p-3 text-sm text-forest-800 sm:p-4">
            <ShieldCheck className="h-5 w-5 min-w-5 text-forest-900" />
            {/* Copy de ejemplo — reemplázalo con tu política real de garantía/envío */}
            Garantía de fabricación y asesoría personalizada en cada compra.
          </div>
        </div>
      </section>

      {/* También te puede interesar */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="luxury-eyebrow">Para ti</p>
              <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-ink sm:text-4xl">
                También te puede interesar
              </h2>
            </div>
            <Link to="/catalogo" className="hidden text-xs uppercase tracking-[0.2em] text-ink-soft md:inline-flex">
              Ver todo
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {relatedProducts.map((related) => (
              <JewelryCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}

      {/* Zoom de imagen */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Cerrar imagen ampliada"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={currentImage}
            alt={product.name}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {/* WhatsApp fijo — solo mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory-soft/95 p-3 backdrop-blur-md lg:hidden">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="luxury-btn luxury-btn-primary w-full"
        >
          <MessageCircle className="h-4 w-4" />
          Consultar por WhatsApp
        </a>
      </div>
    </main>
  );
};

export default ProductDetail;
