import { WhatsAppIcon } from '../components/SocialIcon';
import { ArrowRight, Eye, Quote } from "lucide-react";
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
    image: "/images/material-oro-18k.webp",
    description:
      "Descubre nuestras joyas en oro 18k y encuentra una pieza especial para ti.",
  },
  {
    key: "laminado",
    title: "Oro laminado 18k",
    image: "/images/material-laminado-v2.webp",
    description:
      "Diseños con acabado en oro laminado 18k para combinar con tu estilo.",
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
    <div className="home-storefront bg-ivory text-ink-soft">
      {/* Hero */}
      <section className="home-hero-screen relative isolate overflow-hidden border-b border-line bg-ivory">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/inicio-alpez.webp"
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-110 object-cover object-[68%_center] blur-[1px] md:object-[72%_center]"
          />
          <div className="absolute inset-0 bg-ivory/35" />
          <div className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-ivory via-ivory/90 to-ivory/15 backdrop-blur-[2px] md:w-[68%] md:from-ivory md:via-ivory/90 md:to-transparent" />
        </div>

        <div className="home-hero-content mx-auto flex w-full max-w-7xl items-center px-6 md:px-8">
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
                <WhatsAppIcon className="h-4 w-4 text-forest-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Materiales */}
      <Reveal as="section" className="home-material-section mx-auto max-w-7xl px-6 py-20">
        <div className="home-material-heading">
          <p className="luxury-eyebrow">Nuestras colecciones</p>
          <h2>Elige el material de tu próxima joya</h2>
          <p>Explora nuestras dos colecciones: oro 18k y oro laminado 18k. Selecciona una para descubrir sus piezas.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {materials.map((material) => (
            <Link key={material.key} to={`/catalogo?material=${material.key}`} className={`luxury-card material-card material-card-${material.key} home-material-photo-card`}>
              <div className="home-material-card-copy">
                <h3>{material.title}</h3>
                <p>{material.description}</p>
                <span className="home-material-card-action">Ver colección <ArrowRight size={16} aria-hidden="true" /></span>
              </div>
              <img src={material.image} alt={`Joyas de la colección ${material.title}`} loading="lazy" decoding="async" width={material.key === 'oro-18k' ? 562 : 859} height="1000" />
            </Link>
          ))}
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

      {/* Publicar aquí únicamente testimonios reales con autorización del cliente. */}
      <Reveal as="section" className="customer-reviews mx-auto max-w-7xl px-6 py-20">
        <div className="customer-reviews-panel">
          <div className="customer-reviews-symbol" aria-hidden="true"><Quote size={32} strokeWidth={1.2} /></div>
          <div className="customer-reviews-copy">
            <p className="luxury-eyebrow">Experiencias Alpez</p>
            <h2>Tu experiencia cuenta</h2>
            <p>¿Ya tienes una joya de Alpez? Nos encantará saber cómo fue tu experiencia y qué hace especial tu pieza.</p>
          </div>
          <div className="customer-reviews-action">
            <a href={buildWhatsAppLink('Hola, Alpez. Ya compré una joya y me gustaría compartir mi experiencia: ')} target="_blank" rel="noopener noreferrer" className="shop-button"><WhatsAppIcon size={18} />Compartir mi experiencia</a>
            <p>Conversemos por WhatsApp.<br />Tu opinión nos ayuda a mejorar.</p>
          </div>
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
