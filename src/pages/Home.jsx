import { ArrowRight, Diamond, Eye, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JewelryCard from "../components/JewelryCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import Reveal from "../components/Reveal";
import useDocumentMeta from "../hooks/useDocumentMeta";
import { categories } from "../data/mockProducts";
import { buildWhatsAppLink } from "../utils/whatsappGenerator";

const materials = [
  {
    key: "oro-18k",
    title: "Oro 18k",
    description:
      "Piezas sólidas con brillo premium, durabilidad y valor atemporal para quienes buscan lujo inigualable.",
  },
  {
    key: "laminado",
    title: "Oro laminado 18k",
    description:
      "Apariencia dorada elegante y accesible, ideal para combinar con un estilo diario sofisticado.",
  },
];

// Copy de ejemplo — reemplaza por testimonios reales de tus clientas cuando los tengas.
const testimonials = [
  {
    name: "Camila R.",
    quote: "La atención por WhatsApp fue clara desde el primer mensaje y la pieza superó lo que esperaba.",
  },
  {
    name: "Daniela M.",
    quote: "Se nota la diferencia en el acabado. Es mi segunda compra y no ha sido la última.",
  },
  {
    name: "Valentina S.",
    quote: "Pedí asesoría para un regalo y me guiaron hasta encontrar la pieza correcta.",
  },
];

const heroImage =
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80";

const CategoryCard = ({ category, products }) => {
  const availableProducts = products.filter(
    (product) => product.category === category.key && (product.stock === undefined || product.stock === null || Number(product.stock) > 0),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (availableProducts.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % availableProducts.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [availableProducts.length]);

  const activeProduct = availableProducts[activeIndex % Math.max(availableProducts.length, 1)];

  return (
    <Link to={`/catalogo?categoria=${category.key}`} className="category-card group">
      {activeProduct ? (
        <img
          key={activeProduct.id}
          src={activeProduct.image}
          alt={`${category.label}: ${activeProduct.name}`}
          className="category-card-image"
        />
      ) : (
        <img src={heroImage} alt={category.label} className="category-card-image" />
      )}
      <span className="category-card-overlay" />
      <span className="category-card-content">
        <span className="category-card-label">{category.label}</span>
        <span className="category-card-action">
          Explorar
          <Eye className="h-3 w-3" />
        </span>
      </span>
      {availableProducts.length > 1 && (
        <span className="category-card-dots" aria-label={`${availableProducts.length} productos disponibles`}>
          {availableProducts.map((product, index) => (
            <span key={product.id} className={index === activeIndex % availableProducts.length ? "is-active" : ""} />
          ))}
        </span>
      )}
    </Link>
  );
};

// isLoading: true mientras App.jsx espera la respuesta de la API (opcional).
const Home = ({ products, isLoading = false }) => {
  useDocumentMeta({});
  const whatsappLink = buildWhatsAppLink("Hola, quiero una asesoría para elegir una joya.");

  // Destacados reales: usa el campo `featured` del backend en vez de "los 3 más recientes".
  // Si todavía no hay ningún producto marcado como destacado, cae de vuelta a los primeros 4
  // para que la sección nunca se vea vacía mientras ajustas el panel de admin.
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const showcaseProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <div className="bg-ivory text-ink-soft">
      {/* Hero */}
      <section className="relative isolate min-h-152 overflow-hidden border-b border-line bg-ivory">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-110 object-cover object-[68%_center] blur-[1px] md:object-[72%_center]"
          />
          <div className="absolute inset-0 bg-ivory/35" />
          <div className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-ivory via-ivory/90 to-ivory/15 backdrop-blur-[2px] md:w-[68%] md:from-ivory md:via-ivory/90 md:to-transparent" />
        </div>

        <div className="mx-auto flex min-h-152 max-w-7xl items-center px-6 py-16 md:px-8 md:py-24">
          <div className="max-w-2xl space-y-8 text-center md:text-left">
            <p className="luxury-eyebrow">Joyería fina</p>
            <h1 className="text-4xl font-light leading-[1.05] tracking-[-0.04em] text-ink md:text-6xl">
              Elegancia en <span className="font-semibold text-forest-700">oro 18k</span>
              <br />
              y oro laminado 18k
            </h1>
            <p className="mx-auto max-w-xl text-lg leading-8 text-ink-muted md:mx-0">
              Descubre piezas que equilibran estilo, brillo y valor. Nuestro catálogo está pensado para
              inspirarte y ayudarte a elegir la joya perfecta por WhatsApp.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
              <Link to="/catalogo" className="luxury-btn luxury-btn-primary">
                Explorar catálogo
              </Link>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="luxury-btn luxury-btn-secondary">
                Asesoría WhatsApp
                <MessageCircle className="h-4 w-4 text-forest-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Materiales */}
      <Reveal as="section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {materials.map((material) => (
            <Link key={material.key} to={`/catalogo?material=${material.key}`} className={`luxury-card material-card material-card-${material.key} p-8`}>
              <Diamond className="mb-6 h-10 w-10 text-forest-600" />
              <h2 className="text-3xl font-light uppercase tracking-[0.18em] text-ink">{material.title}</h2>
              <p className="mt-4 text-base leading-7 text-ink-muted">{material.description}</p>
              <span className="luxury-btn-ghost mt-6">
                Ver {material.title}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Historia de marca */}
      <Reveal as="section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 rounded-card-lg border border-line bg-ivory-soft/90 p-8 shadow-[0_20px_45px_rgba(11,37,27,0.03)] md:grid-cols-2 md:items-center md:p-14">
          <div>
            <p className="luxury-eyebrow">Nuestra historia</p>
            <h2 className="mt-3 text-4xl font-light tracking-[-0.03em] text-ink">Hecho para durar</h2>
            {/* Copy de ejemplo — reemplaza con la historia real de Alpez */}
            <p className="mt-5 text-base leading-7 text-ink-muted">
              Alpez nace de la idea de que una joya debe acompañar, no solo decorar. Seleccionamos cada pieza
              pensando en el brillo que se mantiene con el tiempo y en un servicio cercano, directo y honesto
              desde la primera consulta.
            </p>
            <Link to="/catalogo" className="luxury-btn-ghost mt-6">
              Conocer el catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-card-lg border border-gold-200" />
            <img
              src={heroImage}
              alt="Detalle de joyería Alpez"
              className="w-full rounded-card-lg border border-line object-cover shadow-[0_24px_50px_rgba(11,37,27,0.08)]"
            />
          </div>
        </div>
      </Reveal>

      {/* Categorías */}
      <Reveal as="section" className="bg-stone py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="luxury-eyebrow">Categorías</p>
            <h2 className="mt-3 text-4xl font-light tracking-tight text-ink">Encuentra tu estilo</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <CategoryCard key={category.key} category={category} products={products} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Destacados */}
      <Reveal as="section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="luxury-eyebrow">Destacados</p>
            <h2 className="mt-3 text-4xl font-light tracking-tight text-ink">Nuestras favoritas</h2>
          </div>
          <Link to="/catalogo" className="hidden text-xs uppercase tracking-[0.2em] text-ink-soft md:inline-flex">
            Ver todo
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : showcaseProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {showcaseProducts.map((product) => (
              <JewelryCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-card-lg border border-dashed border-sand-strong bg-ivory-soft/90 px-6 py-14 text-center">
            <p className="text-ink-muted">Todavía no hay productos cargados desde el backend.</p>
          </div>
        )}
      </Reveal>

      {/* Testimonios */}
      <Reveal as="section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="luxury-eyebrow">Lo que dicen</p>
          <h2 className="mt-3 text-4xl font-light tracking-tight text-ink">Clientas que confiaron en Alpez</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="luxury-card p-6">
              <div className="luxury-divider mb-4 justify-start">
                <span className="luxury-divider-mark" />
              </div>
              <p className="text-sm leading-7 text-ink-muted">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-ink-faint">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Instagram */}
      <Reveal as="section" className="bg-stone py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="luxury-eyebrow">Síguenos</p>
              <h2 className="mt-3 text-4xl font-light tracking-tight text-ink">@alpezjoyeria</h2>
            </div>
            <a
              href="https://www.instagram.com/joyeria.alpez?stkn=dnp3ZTN4MGFuZ2Fk"
              target="_blank"
              rel="noreferrer"
              className="hidden text-xs uppercase tracking-[0.2em] text-ink-soft md:inline-flex"
            >
              Ver perfil
            </a>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-6">
            {products.slice(0, 6).map((product) => (
              <a
                key={product.id}
                href="https://www.instagram.com/joyeria.alpez?stkn=dnp3ZTN4MGFuZ2Fk"
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-line"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default Home;
