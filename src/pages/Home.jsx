import { ArrowRight, MessageCircle, Package, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import JewelryCard from "../components/JewelryCard";
import ProductImage from "../components/ProductImage";
import InstagramProfile from '../components/InstagramProfile';
import TikTokProfile from '../components/TikTokProfile';
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
    (product) => product.category === category.key,
  );
  const activeProduct = availableProducts[0];

  return (
    <Link to={`/catalogo?categoria=${category.key}`} className="category-card group">
      {activeProduct ? (
        <ProductImage
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
          <ArrowRight className="h-3 w-3" />
        </span>
      </span>
      {availableProducts.length > 0 && <span className="category-card-count">{availableProducts.length} {availableProducts.length === 1 ? 'pieza' : 'piezas'}</span>}
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
      <section className="home-hero-screen">
        <div className="home-hero-visual">
          <ProductImage
            src="/images/inicio-alpez.webp"
            alt="Detalle de una joya Alpez con balines dorados"
            eager
          />
        </div>

        <div className="home-hero-content">
          <div className="home-hero-copy">
            <p className="luxury-eyebrow">Joyería Alpez</p>
            <h1>Una joya para<br />cada momento.</h1>
            <p>Descubre nuestras piezas en oro 18k y oro laminado. Encuentra la que va contigo.</p>

            <div className="home-hero-actions">
              <Link to="/catalogo" className="luxury-btn luxury-btn-primary">
                Explorar catálogo
              </Link>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="shop-text-link">
                Asesoría personalizada <ArrowRight size={16} />
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

      {/* Destacados */}
      <Reveal as="section" className="home-featured mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="luxury-eyebrow">Destacados</p>
            <h2 className="mt-3 text-4xl font-light tracking-tight text-ink">Nuestras favoritas</h2>
          </div>
          <Link to="/catalogo" className="shop-text-link">
            Ver todo <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : showcaseProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
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

      {/* Categorías */}
      <Reveal as="section" className="home-categories bg-stone py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="luxury-eyebrow">Categorías</p>
            <h2 className="mt-3 text-4xl font-light tracking-tight text-ink">Encuentra tu estilo</h2>
          </div>

          <div className="home-category-grid">
            {categories.filter(category => products.some(product => product.category === category.key)).map((category) => (
              <CategoryCard key={category.key} category={category} products={products} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="home-service-section mx-auto max-w-7xl px-6 py-20">
        <div className="home-material-heading"><p className="luxury-eyebrow">TE ACOMPAÑAMOS</p><h2>Elige con confianza</h2></div>
        <div className="home-services">
          <article><MessageCircle size={24} strokeWidth={1.3} /><h3>Atención personal</h3><p>Te ayudamos a elegir y confirmamos disponibilidad por WhatsApp.</p><a href={whatsappLink} target="_blank" rel="noreferrer">Hablar con Alpez <ArrowRight size={14} /></a></article>
          <article><ShieldCheck size={24} strokeWidth={1.3} /><h3>Garantía de tu pieza</h3><p>Consulta la cobertura y los cuidados según el material de tu joya.</p><Link to="/garantias-y-cambios">Conocer la garantía <ArrowRight size={14} /></Link></article>
          <article><Package size={24} strokeWidth={1.3} /><h3>Entrega coordinada</h3><p>Acordamos contigo las opciones de entrega y el total antes de confirmar.</p><a href={buildWhatsAppLink('Hola, Alpez. Quisiera conocer las opciones de entrega para mi pedido.')} target="_blank" rel="noreferrer">Consultar entrega <ArrowRight size={14} /></a></article>
        </div>
      </Reveal>

      <InstagramProfile />
      <TikTokProfile />

    </div>
  );
};

export default Home;
