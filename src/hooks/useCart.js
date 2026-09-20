import { useEffect, useState } from 'react';
import { CART_KEY, parseCart, stockLimit } from '../utils/cart';
import { useToast } from './useToast';

export default function useCart(products) {
  const { showToast } = useToast();
  const [items, setItems] = useState(() => {
    try { return parseCart(localStorage.getItem(CART_KEY)); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* El carrito sigue disponible durante esta sesión. */ }
  }, [items]);
  useEffect(() => {
    const sync = event => { if (event.key === CART_KEY || event.key === null) setItems(parseCart(event.newValue)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const add = product => {
    const id = String(product.id);
    const quantity = items.find(item => item.id === id)?.quantity || 0;
    if (quantity >= stockLimit(product)) {
      showToast('Ya tienes en el carrito la cantidad disponible de esta pieza.', 'error');
      return;
    }
    setItems(current => {
      const existing = current.find(item => item.id === id);
      return existing ? current.map(item => item.id === id ? { ...item, quantity: Math.min(item.quantity + 1, stockLimit(product)) } : item) : [...current, { id, quantity: 1 }];
    });
    showToast('Joya agregada al carrito.');
  };
  const setQuantity = (id, quantity) => {
    const limit = stockLimit(products.find(product => String(product.id) === id));
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > limit) return;
    setItems(current => current.map(item => item.id === id ? { ...item, quantity } : item));
  };
  return { items, add, setQuantity, count: items.reduce((sum, item) => sum + item.quantity, 0),
    remove: id => setItems(current => current.filter(item => item.id !== id)), clear: () => setItems([]) };
}
