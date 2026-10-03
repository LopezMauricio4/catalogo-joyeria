import { useState } from "react";
import { ArrowLeft, Loader2, Save, Star } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { categories, materialLabels } from "../data/mockProducts";
import ProductGalleryEditor from '../components/ProductGalleryEditor';
import { imageOrder } from '../utils/imageOrder';
import { disclosureFeatures, readProductDisclosure } from '../utils/productDisclosure';
import { prepareProductImages } from '../utils/productUpload';


const emptyProduct = {
  id: "",
  name: "",
  material: "oro-18k",
  category: "anillos",
  price: "",
  featured: false,
  image: "",
  description: "",
  features: "",
  composition: '',
  measurements: '',
};

const ProductEditor = ({ onSaveProduct, onCancel, product }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState(product ? { ...product, image: '', price: String(product.price), ...readProductDisclosure(product.features) } : emptyProduct);
  const editingId = product?.id;
  const needsMeasurements = ['cadenas', 'pulseras'].includes(form.category);

  const [gallery, setGallery] = useState(() => [...new Set([product?.image, ...(product?.images || [])].filter(Boolean))].map((src, index) => ({ id: 'existing:' + index, src })));
  const selectedFiles = gallery.filter(image => image.file).map(image => image.file);
  const existingImages = gallery.filter(image => image.src).map(image => image.src);
  const originalImages = [...new Set([product?.image, ...(product?.images || [])].filter(Boolean))];
  const linkedImageCount = form.image.trim() && !existingImages.includes(form.image.trim()) ? 1 : 0;
  const imageCount = existingImages.length + selectedFiles.length + linkedImageCount;
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    // El estado es la selección definitiva que se envía; permite volver a elegir una foto quitada.
    event.target.value = '';
    if (!files.length) return;
    const newFiles = files.filter(file => !selectedFiles.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified));
    if (imageCount + newFiles.length > 5) { setFormError("El producto puede tener hasta 5 imágenes. Quita alguna antes de agregar más."); return; }
    if (newFiles.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setFormError('Usa imágenes JPG, PNG, WEBP o AVIF de máximo 5 MB cada una.'); return;
    }
    setFormError(""); setGallery(current => [...current, ...newFiles.map(file => ({ id: 'new:' + crypto.randomUUID(), file }))]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    setFormError("");

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();

    if (!trimmedName || !trimmedDescription || (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0)) {
      setFormError("Completa nombre, descripción y un precio válido antes de guardar.");
      return;
    }
    if (needsMeasurements && !form.measurements.trim()) { setFormError('Completa las medidas y tallas de la cadena o pulsera.'); return; }
    if (imageCount > 5) { setFormError('El producto puede tener hasta 5 imágenes. Quita alguna antes de guardar.'); return; }
    if (!imageCount) { setFormError('Conserva o agrega al menos una imagen del producto.'); return; }


    const productPayload = new FormData();
    productPayload.append("name", trimmedName);
    productPayload.append("description", trimmedDescription);
    productPayload.append("price", String(Number(form.price)));
    productPayload.append("material", form.material);
    productPayload.append("category", form.category);

    productPayload.append("featured", String(form.featured));
    if (editingId) productPayload.append('removedImages', JSON.stringify(originalImages.filter(src => !existingImages.includes(src))));
    disclosureFeatures({ ...form, measurements: needsMeasurements ? form.measurements : '' }).forEach(feature => productPayload.append('features', feature));

    if (form.image && form.image.trim()) {
      productPayload.append("image", form.image.trim());
    }

    try {
      setIsSaving(true);
      const files = await prepareProductImages(selectedFiles);
      files.forEach(file => productPayload.append('imagenes', file));
      productPayload.append('imageOrder', JSON.stringify([...imageOrder(gallery), ...(linkedImageCount ? [form.image.trim()] : [])]));
      await onSaveProduct(productPayload, editingId);
      showToast(editingId ? "Producto actualizado" : "Producto creado", "success");
      onCancel();
    } catch (error) {
      setFormError(error.message || "No se pudo guardar el producto.");
      showToast(error.message || "No se pudo guardar el producto.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="product-editor-page product-editor-compact mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="luxury-eyebrow">Administrador</p>
          <h1 className="mt-3 text-5xl font-medium tracking-[-0.04em] text-ink md:text-6xl">
            {editingId ? 'Editar producto' : 'Agregar producto'}
          </h1>
        </div>
        <button type="button" disabled={isSaving} onClick={onCancel} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          <ArrowLeft className="h-4 w-4" />
          Volver a administración
        </button>
      </div>

      <div className="mx-auto max-w-4xl">
        <section className="product-editor-card">
          {editingId && <p className="product-editor-note">{product.visible ? "Visible en el catálogo." : "Oculto: guardar cambios no lo publicará."}</p>}
          <form onSubmit={handleSubmit}><fieldset disabled={isSaving} className="product-editor-fields">
            <div className="product-editor-section">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="product-editor-field">
                Nombre
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="Ej. Anillo Aurora"
                />
              </label>


            </div>
            </div>

            <div className="product-editor-section">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="product-editor-field">
                Categoría
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                >
                  {categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="product-editor-field">
                Material
                <select
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                >
                  <option value="oro-18k">{materialLabels["oro-18k"]}</option>
                  <option value="laminado">{materialLabels.laminado}</option>
                </select>
              </label>
            </div>


            {needsMeasurements && <div className="grid gap-5 md:grid-cols-2">
              <label className="product-editor-field">Medidas y tallas<input required name="measurements" value={form.measurements} onChange={handleChange} placeholder="Ej. longitud 18 cm, grosor 3 mm" /></label>
            </div>}
            <div className="grid gap-5 md:grid-cols-2">

              <label className="product-editor-featured mt-2 flex items-center gap-3 self-end rounded-2xl border border-line bg-ivory-soft px-4 py-3.5 text-sm text-ink-soft">
                <input
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-line-strong text-gold-500 focus:ring-gold-400"
                />
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-gold-500" />
                  Marcar como destacado
                </span>
              </label>
            </div>
            </div>

            <section className="product-editor-section">
<div className="product-final-price">              <label className="product-editor-field">
              Precio final de la pieza (COP, impuestos incluidos)
                <input
                  required name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="4200"
                />
              </label></div>
</section>
            <div className="product-editor-section">
            <label className="product-editor-field">
              {editingId ? 'Agregar imagen por URL (opcional)' : 'Imagen (URL opcional)'}
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                placeholder="https://images.unsplash.com/..."
              />
            </label>

            <label className="product-editor-field">
              Imágenes del producto (máximo 5)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleFileChange}
                className="product-editor-file-input mt-2 block w-full"
              />
            </label>
            {gallery.length > 0 && <ProductGalleryEditor images={gallery} onChange={updater => { setGallery(updater); setFormError('' ); }} />}
            <p className="text-sm text-ink-muted" role="status">{imageCount}/5 imágenes en el producto.</p>

            <p className="text-sm text-ink-muted editor-gallery-note">Arrastra las fotos para ordenarlas. La primera será la portada. Los cambios se aplican al guardar.</p>
            </div>

            <div className="product-editor-section">
            <label className="product-editor-field">
              Descripción
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="2"
                className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                placeholder="Describe la pieza..."
              />
            </label>

            <label className="product-editor-field">
              Características
              <textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                rows="2"
                className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                placeholder="18 kilates, Acabado brillante, Diseño atemporal"
              />
            </label>
            </div>

            {formError && (
              <p role="alert" className="product-editor-error">
                {formError}
              </p>
            )}

            <div className="product-editor-actions">
              <button
                type="submit"
                disabled={isSaving}
                className="luxury-btn luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Guardar cambios" : "Crear producto"}
              </button>

              <button type="button" onClick={onCancel} disabled={isSaving} className="luxury-btn luxury-btn-secondary">
                Cancelar
              </button>
            </div>
          </fieldset></form>
        </section>

      </div>
    </main>
  );
};

export default ProductEditor;

