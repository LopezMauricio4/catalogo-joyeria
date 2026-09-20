import { getAccessToken } from "./authApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = async () => {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80';

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
    stock: Number(product.stock ?? 10),
    featured: Boolean(product.featured ?? product.destacado),
  };
};

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error('No se pudo cargar el catálogo desde la API.');
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeProduct) : [];
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
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo eliminar el producto.');
  }

  return normalizeProduct(data.product);
};
