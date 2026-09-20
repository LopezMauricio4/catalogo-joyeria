/**
 * ProductCardSkeleton — placeholder animado con la misma silueta que JewelryCard.
 * Se muestra mientras los productos cargan desde la API, en vez de un vacío
 * repentino o un spinner genérico.
 */
const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-card border border-line bg-ivory-soft/90 sm:rounded-card-lg">
      <div className="h-40 w-full bg-sand/60 sm:h-52 md:h-64" />
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="h-2 w-1/3 rounded-full bg-sand/70" />
        <div className="h-5 w-4/5 rounded-full bg-sand/70" />
        <div className="mt-2 h-px w-full bg-line" />
        <div className="h-2 w-1/4 rounded-full bg-sand/60" />
        <div className="h-5 w-1/2 rounded-full bg-sand/70" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;