import { getAccessToken } from './authApi';
const base = import.meta.env.VITE_API_URL || '/api';
async function request(path, options = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Inicia sesión para administrar ventas.');
  const response = await fetch(`${base}/sales${path}`, { ...options, cache: 'no-store', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación.');
  return data;
}
export const fetchSales = (page, signal) => request(`?page=${page}`, { signal });
export const createSale = payload => request('', { method: 'POST', body: JSON.stringify(payload) });
