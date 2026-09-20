import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { materialLabels } from '../data/mockProducts';

const isRecentlyAdded = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const daysSinceCreated = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return daysSinceCreated <= 14;
};

const JewelryCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;
  const isNew = isRecentlyAdded(product.createdAt);

  return (
    <article className="luxury-card group h-full overflow-hidden sm:rounded-card-lg">
      <Link to={`/producto/${product.id}`} className="flex h-full flex-col">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className={`h-40 w-full object-cover transition-transform duration-500 sm:h-52 md:h-64 ${
              outOfStock ? 'grayscale' : 'group-hover:scale-[1.03]'
            }`}
          />

          {/* Badges — destacado y nuevo, sin pisarse entre sí */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5 sm:left-4 sm:top-4">
            {product.featured && (
              <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.16em] text-forest-900 shadow-sm sm:text-[8px]">
                Destacado
              </span>
            )}
            {isNew && (
              <span className="rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[7px] font-medium uppercase tracking-[0.16em] text-ink-soft backdrop-blur-sm sm:text-[8px]">
                Nuevo
              </span>
            )}
          </div>

          <span className="absolute right-3 top-3 rounded-full border border-white/70 bg-white/85 px-2 py-1 text-[7px] font-medium uppercase tracking-[0.14em] text-ink-soft backdrop-blur-sm sm:right-4 sm:top-4 sm:px-2.5 sm:text-[8px]">
            {materialLabels[product.material]}
          </span>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-forest-900/45">
              <span className="rounded-full bg-forest-900 px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] text-white">
                Agotado
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] uppercase tracking-[0.18em] text-ink-faint sm:text-[9px]">
                {product.category}
              </p>
              <h3 className="mt-1 line-clamp-2 font-display text-[1.35rem] leading-[0.9] tracking-[-0.04em] text-ink sm:text-[1.8rem]">
                {product.name}
              </h3>
            </div>
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand/60 text-ink-soft transition group-hover:bg-gold-400 group-hover:text-forest-900 sm:h-8 sm:w-8">
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>

          <div className="mt-auto border-t border-line pt-2 sm:pt-3">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[8px] uppercase tracking-[0.18em] text-ink-faint sm:text-[9px]">Desde</p>
                <p className="mt-1 whitespace-nowrap text-lg font-semibold text-ink sm:text-xl">
                  ${product.price.toLocaleString('es-MX')}
                </p>
              </div>
              {lowStock && !outOfStock && (
                <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.14em] text-gold-600">
                  Últimas piezas
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default JewelryCard;
