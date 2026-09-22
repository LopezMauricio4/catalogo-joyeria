import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Star } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { categories, materialLabels } from "../data/mockProducts";
import ProductImage from '../components/ProductImage';

const emptyProduct = {
  id: "",
  name: "",
  material: "oro-18k",
  category: "anillos",
  price: "",
  stock: "10",
  featured: false,
  image: "",
  description: "",
  features: "",
};

const ImagePreview = ({ file, index }) => {
  const ref = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <img ref={ref} alt={`Vista previa ${index + 1}`} className="h-16 w-16 rounded-xl border border-line object-cover" />;
};

const ProductEditor = ({ onSaveProduct, onCancel, product }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState(product ? { ...product, price: String(product.price), stock: String(product.stock ?? 0), features: product.features.join(", ") } : emptyProduct);
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
    if (files.length > 5) { setFormError("Selecciona como máximo 5 imágenes."); event.target.value = ""; setSelectedFiles([]); return; }
    setFormError(""); setSelectedFiles(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    setFormError("");

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const stockValue = Number(form.stock);

    if (!trimmedName || !trimmedDescription || (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0)) {
      setFormError("Completa nombre, descripción y un precio válido antes de guardar.");
      return;
    }

    if (!Number.isSafeInteger(stockValue) || stockValue < 0) {
      setFormError("El stock debe ser un número igual o mayor a 0.");
      return;
    }

    const productPayload = new FormData();
    productPayload.append("name", trimmedName);
    productPayload.append("description", trimmedDescription);
    productPayload.append("price", String(Number(form.price)));
    productPayload.append("material", form.material);
    productPayload.append("category", form.category);
    // Antes esto iba fijo en "10" y "false" incluso al editar — se perdía el
    // stock real y el estado de "destacado" de cada producto cada vez que se
    // guardaba una edición. Ahora se manda lo que realmente hay en el formulario.
    productPayload.append("stock", String(stockValue));
    productPayload.append("featured", String(form.featured));
    productPayload.append("features", form.features || "");

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
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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

      <div className="mx-auto max-w-3xl">
        <section className="rounded-card-lg border border-line bg-ivory-soft/90 p-6 shadow-[0_20px_45px_rgba(11,37,27,0.04)] md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage text-ink-soft">
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <h2 className="text-3xl font-medium text-ink">
              {editingId ? "Editar producto" : "Nuevo producto"}
            </h2>
          </div>

          {editingId && <p className="mb-5 text-sm">{product.visible ? "Visible en el catálogo." : "Oculto: guardar cambios no lo publicará."} Si no eliges nuevas fotos, se conserva la galería actual.</p>}
          <form onSubmit={handleSubmit}><fieldset disabled={isSaving} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-ink-muted">
                Nombre
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="Ej. Anillo Aurora"
                />
              </label>

              <label className="block text-sm text-ink-muted">
              Precio (COP)
                <input
                  name="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="4200"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-ink-muted">
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

              <label className="block text-sm text-ink-muted">
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

            {/* Stock real — antes se mandaba "10" fijo sin importar lo que hubiera */}
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-ink-muted">
                Stock disponible
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                  placeholder="10"
                />
              </label>

              <label className="mt-2 flex items-center gap-3 self-end rounded-2xl border border-line bg-ivory-soft px-4 py-3.5 text-sm text-ink-soft">
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

            <label className="block text-sm text-ink-muted">
              Imagen (URL opcional)
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-ink-soft outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                placeholder="https://images.unsplash.com/..."
              />
            </label>

            <label className="block text-sm text-ink-muted">
              Imágenes del producto (máximo 5)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-sm text-ink-soft outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-sage file:px-3 file:py-2 file:text-[9px] file:font-medium file:uppercase file:tracking-[0.18em] file:text-ink-soft focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <ImagePreview key={`${file.name}-${index}`} file={file} index={index} />
                  ))}
                </div>
              )}
            </label>

            {editingId && selectedFiles.length === 0 && <div className="flex flex-wrap gap-2" aria-label="Imágenes actuales">{product.images.map((src, index) => <ProductImage key={`${src}-${index}`} src={src} alt={`Imagen actual ${index + 1}`} className="h-16 w-16 rounded-xl object-cover" />)}</div>}
            <p className="text-sm text-ink-muted">Los archivos nuevos reemplazan la galería. Si hay una URL indicada, también se incluye como imagen.</p>

            <label className="block text-sm text-ink-muted">
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

            <label className="block text-sm text-ink-muted">
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

            {formError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
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
