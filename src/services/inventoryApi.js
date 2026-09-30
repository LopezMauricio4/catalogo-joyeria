import { getAccessToken } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const authHeaders = async () => {
  const token = await getAccessToken();
  if (!token) throw new Error('Inicia sesión para administrar el inventario.');
  return { Authorization: `Bearer ${token}` };
};

const normalizeItem = item => ({
  ...item,
  stock: Number(item.stock ?? 0),
  minStock: Number(item.minStock ?? 0),
  unitCost: Number(item.unitCost ?? 0),
  salePrice: Number(item.salePrice ?? 0),
  images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
});

const responseData = async response => {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación.');
  return data;
};

export const fetchInventory = async signal => {
  const response = await fetch(`${API_BASE_URL}/inventory`, { headers: await authHeaders(), signal, cache: 'no-store' });
  const data = await responseData(response);
  if (!Array.isArray(data)) throw new Error('La respuesta del inventario no es válida.');
  return data.map(normalizeItem);
};

const saveItem = async (method, id, formData) => {
  const response = await fetch(`${API_BASE_URL}/inventory${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method, headers: await authHeaders(), body: formData,
  });
  const data = await responseData(response);
  return normalizeItem(data.item);
};

export const createInventoryItem = formData => saveItem('POST', '', formData);
export const updateInventoryItem = (id, formData) => saveItem('PUT', id, formData);

export const addInventoryMovement = async (id, movement) => {
  const response = await fetch(`${API_BASE_URL}/inventory/${encodeURIComponent(id)}/movements`, {
    method: 'POST', headers: { ...await authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(movement),
  });
  const data = await responseData(response);
  return normalizeItem(data.item);
};
