import { getAccessToken } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = async () => {
  const token = await getAccessToken();
  if (!token) throw new Error('Inicia sesión para administrar los productos.');
  return { Authorization: `Bearer ${token}` };
};

const normalizeProduct = (product) => {
  const rawFeatures = Array.isArray(product.features)
    ? product.features
    : typeof product.features === 'string'
      ? product.features.split(',')
      : [];

  const normalizedImages = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : Array.isArray(product.imagenesUrls)
      ? product.imagenesUrls.filter(Boolean)
      : [];

  const primaryImage =
    product.image ??
    normalizedImages[0] ??
    '';

  return {
    id: product.id,
    name: product.name ?? product.nombre ?? 'Producto',
    material: product.material ?? 'oro-18k',
    category: product.category ?? product.categoria ?? 'anillos',
    price: Number(product.price ?? product.precio ?? 0),
    image: primaryImage,
    images: normalizedImages.length > 0 ? normalizedImages : [primaryImage],
    description: product.description ?? product.descripcion ?? '',
    features: rawFeatures.map((feature) => String(feature).trim()).filter(Boolean),
    stock: product.stock == null ? null : Number(product.stock),
    featured: Boolean(product.featured ?? product.destacado),
    visible: product.visible !== false,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const fetchProducts = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_BASE_URL}/products`, { signal: controller.signal });
    if (!response.ok) throw new Error('No se pudo cargar el catálogo.');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('La respuesta del catálogo no es válida.');
    return data.map(normalizeProduct);
  } finally { clearTimeout(timeout); }
};

export const fetchAdminProducts = async (signal) => {
  const response = await fetch(`${API_BASE_URL}/products/admin`, { headers: await getAuthHeaders(), signal, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudieron cargar los productos.');
  if (!Array.isArray(data)) throw new Error('La respuesta de productos no es válida.');
  return data.map(normalizeProduct);
};

export const setProductVisibility = async (id, visible) => {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}/visibility`, {
    method: 'PATCH', headers: { ...await getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ visible }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo cambiar la visibilidad.');
  return normalizeProduct(data.product);
};

export const createProduct = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo crear el producto.');
  }

  return normalizeProduct(data.product);
};

export const deleteProduct = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar el producto.');
  }

  return normalizeProduct(data.product);
};

export const updateProduct = async (productId, formData) => {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`, {
    method: 'PUT', headers: await getAuthHeaders(), body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo actualizar el producto.');
  return normalizeProduct(data.product);
};
