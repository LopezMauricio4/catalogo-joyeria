import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Search, ShieldCheck, Star, Trash2 } from "lucide-react";
import { useToast } from "../components/ToastProvider";
import { categories, materialLabels } from "../data/mockProducts";

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

// useToast requiere que App.jsx esté envuelto en <ToastProvider>.
// Si todavía no lo agregaste, esto degrada a un no-op silencioso
// en vez de romper la página — ver ToastProvider.jsx para conectarlo.
const useSafeToast = () => {
  try {
    return useToast();
  } catch {
    return { showToast: () => {} };
  }
};

const AdminProductsPage = ({ products, onSaveProduct, onDeleteProduct }) => {
  const { showToast } = useSafeToast();
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  // Genera y limpia los object URLs de las imágenes seleccionadas para el preview
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => product.name.toLowerCase().includes(normalized));
  }, [products, search]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files || []));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const stockValue = Number(form.stock);

    if (!trimmedName || !trimmedDescription || Number(form.price) <= 0) {
      setFormError("Completa nombre, descripción y un precio válido antes de guardar.");
      return;
    }

    if (Number.isNaN(stockValue) || stockValue < 0) {
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
      await onSaveProduct(productPayload);
      showToast(editingId ? "Producto actualizado" : "Producto creado", "success");
      setForm(emptyProduct);
      setSelectedFiles([]);
      setEditingId(null);
    } catch {
      showToast("No se pudo guardar el producto. Intenta de nuevo.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setSelectedFiles([]);
    setFormError("");
    setForm({
      ...product,
      price: String(product.price),
      stock: String(product.stock ?? 0),
      featured: Boolean(product.featured),
      features: Array.isArray(product.features) ? product.features.join(", ") : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setForm(emptyProduct);
    setSelectedFiles([]);
    setEditingId(null);
    setFormError("");
  };

  const handleDeleteClick = async (productId) => {
    if (pendingDeleteId !== productId) {
      setPendingDeleteId(productId);
      return;
    }

    try {
      await onDeleteProduct(productId);
      showToast("Producto eliminado", "success");
    } catch {
      showToast("No se pudo eliminar el producto.", "error");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="luxury-eyebrow">Administrador</p>
          <h1 className="mt-3 text-5xl font-medium tracking-[-0.04em] text-ink md:text-6xl">
            Crear y editar productos
          </h1>
        </div>
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-card-lg border border-line bg-ivory-soft/90 p-6 shadow-[0_20px_45px_rgba(11,37,27,0.04)] md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage text-ink-soft">
              {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <h2 className="text-3xl font-medium text-ink">
              {editingId ? "Editar producto" : "Nuevo producto"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                Precio
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
              Imágenes del producto
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-2xl border border-line bg-ivory-soft px-4 py-3 text-sm text-ink-soft outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-sage file:px-3 file:py-2 file:text-[9px] file:font-medium file:uppercase file:tracking-[0.18em] file:text-ink-soft focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
              />
              {previewUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <img
                      key={url}
                      src={url}
                      alt={`Vista previa ${index + 1}`}
                      className="h-16 w-16 rounded-xl border border-line object-cover"
                    />
                  ))}
                </div>
              )}
            </label>

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
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

              <button type="button" onClick={handleReset} className="luxury-btn luxury-btn-secondary">
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-card-lg border border-line bg-stone p-6 shadow-[0_20px_45px_rgba(11,37,27,0.04)] md:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-ink-soft" />
              <h2 className="text-2xl font-medium text-ink">Productos actuales</h2>
            </div>
            <span className="text-xs text-ink-faint">{filteredProducts.length}</span>
          </div>

          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto..."
              className="w-full rounded-full border border-line bg-white py-2.5 pl-9 pr-4 text-sm text-ink-soft outline-none transition focus:border-gold-400"
            />
          </div>

          <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const outOfStock = typeof product.stock === "number" && product.stock <= 0;
              const isPendingDelete = pendingDeleteId === product.id;

              return (
                <div key={product.id} className="rounded-card border border-line bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                          {materialLabels[product.material]}
                        </p>
                        {product.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-gold-700">
                            <Star className="h-2.5 w-2.5" />
                            Destacado
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 truncate text-base font-medium text-ink-soft">{product.name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-soft">
                          ${product.price.toLocaleString("es-MX")}
                        </p>
                        <span className={`text-xs ${outOfStock ? "text-red-600" : "text-ink-faint"}`}>
                          {outOfStock ? "Sin stock" : `Stock: ${product.stock}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sage px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-forest-800 transition hover:bg-sage/70"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(product.id)}
                      onBlur={() => setPendingDeleteId(null)}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                        isPendingDelete
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-line bg-white text-ink-faint hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isPendingDelete ? "¿Confirmar?" : "Borrar"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <p className="py-8 text-center text-sm text-ink-faint">No hay productos que coincidan.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default AdminProductsPage;
