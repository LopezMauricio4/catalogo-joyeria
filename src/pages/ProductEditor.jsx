import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Star, X, ZoomIn } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { categories, materialLabels } from "../data/mockProducts";
import ProductImage from '../components/ProductImage';
import Modal from '../components/Modal';
import { disclosureFeatures, readProductDisclosure } from '../utils/productDisclosure';


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

const ImagePreview = ({ file, index, onRemove }) => {
  const ref = useRef(null);
  const [preview, setPreview] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(file);
    ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className="editor-image-tile">
    <button type="button" className="editor-image-open" onClick={() => setPreview(ref.current.src)} aria-label={`Ampliar imagen ${index + 1}: ${file.name}`}>
      <img ref={ref} alt={file.name} /><span aria-hidden="true"><ZoomIn size={16} /></span>
    </button>
    <button type="button" className="editor-image-remove" onClick={onRemove} aria-label={`Quitar imagen ${index + 1}: ${file.name}`}><X size={16} /></button>
    <p title={file.name}>{file.name}</p>
    <Modal open={Boolean(preview)} onClose={() => setPreview('')} title="Vista previa de la imagen" className="editor-image-dialog">
      <img src={preview || undefined} alt={file.name} className="editor-image-expanded" />
      <p className="mt-3 break-all text-sm text-ink-muted">{file.name}</p>
    </Modal>
  </div>;
};

const ProductEditor = ({ onSaveProduct, onCancel, product }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState(product ? { ...product, price: String(product.price), ...readProductDisclosure(product.features) } : emptyProduct);
  const editingId = product?.id;
  const [selectedFiles, setSelectedFiles] = useState([]);
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
    if (selectedFiles.length + newFiles.length > 5) { setFormError("Puedes subir hasta 5 imágenes. Quita alguna antes de agregar más."); return; }
    if (newFiles.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setFormError('Usa imágenes JPG, PNG, WEBP o AVIF de máximo 5 MB cada una.'); return;
    }
    setFormError(""); setSelectedFiles(current => [...current, ...newFiles]);
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
    if (!form.composition.trim() || !form.measurements.trim()) { setFormError('Completa la composición y las medidas de la pieza.'); return; }


    const productPayload = new FormData();
    productPayload.append("name", trimmedName);
    productPayload.append("description", trimmedDescription);
    productPayload.append("price", String(Number(form.price)));
    productPayload.append("material", form.material);
    productPayload.append("category", form.category);

    productPayload.append("featured", String(form.featured));
    disclosureFeatures(form).forEach(feature => productPayload.append('features', feature));

    if (form.image && form.image.trim()) {
      productPayload.append("image", form.image.trim());
    }

    selectedFiles.forEach((file) => {
      productPayload.append("imagenes", file);
    });

    try {
      setIsSaving(true);
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
    <main className="product-editor-page mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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
          <div className="product-editor-card-heading">
            <div className="product-editor-icon">
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <div><p className="luxury-eyebrow">Ficha de producto</p><h2>{editingId ? "Editar producto" : "Nuevo producto"}</h2></div>
          </div>

          {editingId && <p className="product-editor-note">{product.visible ? "Visible en el catálogo." : "Oculto: guardar cambios no lo publicará."}</p>}
          <form onSubmit={handleSubmit}><fieldset disabled={isSaving} className="space-y-5">
            <div className="product-editor-section"><div className="product-editor-section-title"><span>01</span><div><h3>Información básica</h3></div></div>
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

            <div className="product-editor-section"><div className="product-editor-section-title"><span>02</span><div><h3>Clasificación</h3></div></div>
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


            <div className="grid gap-5 md:grid-cols-2">
              <label className="product-editor-field">Composición y materiales<input required name="composition" value={form.composition} onChange={handleChange} placeholder="Indica composición real, recubrimiento y otros materiales" /></label>
              <label className="product-editor-field">Medidas y tallas<input required name="measurements" value={form.measurements} onChange={handleChange} placeholder="Ej. longitud 18 cm, grosor 3 mm" /></label>
            </div>
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

            <section className="product-editor-section"><div className="product-editor-section-title"><span>03</span><div><h3>Precio</h3></div></div>
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
            <div className="product-editor-section"><div className="product-editor-section-title"><span>04</span><div><h3>Imágenes</h3></div></div>
            <label className="product-editor-field">
              Imagen (URL opcional)
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
              {selectedFiles.length > 0 && (
                <div className="editor-image-selection" aria-label="Imágenes seleccionadas para subir">
                  {selectedFiles.map((file, index) => (
                    <ImagePreview key={`${file.name}-${file.size}-${file.lastModified}`} file={file} index={index} onRemove={() => { setSelectedFiles(current => current.filter(item => item !== file)); setFormError(''); }} />
                  ))}
                </div>
              )}
            <p className="text-sm text-ink-muted" role="status">{selectedFiles.length}/5 imágenes seleccionadas.</p>

            {editingId && selectedFiles.length === 0 && <div className="flex flex-wrap gap-2" aria-label="Imágenes actuales">{product.images.map((src, index) => <ProductImage key={`${src}-${index}`} src={src} alt={`Imagen actual ${index + 1}`} className="h-16 w-16 rounded-xl object-cover" />)}</div>}
            <p className="text-sm text-ink-muted">Las fotos nuevas reemplazan la galería actual.</p>
            </div>

            <div className="product-editor-section"><div className="product-editor-section-title"><span>05</span><div><h3>Descripción y características</h3></div></div>
            <label className="product-editor-field">
              Descripción
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
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
                rows="3"
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

