import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import AuthPage from "./pages/AuthPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import { createProduct, updateProduct, deleteProduct, fetchProducts, setProductVisibility } from "./services/productApi";
import { mapSupabaseUser, signOut } from "./services/authApi";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { useToast } from "./hooks/useToast";
import useCart from './hooks/useCart';
import Cart from './pages/Cart';
import GuaranteesPage from "./pages/GuaranteesPage";

function RouteScroll() {
  const location = useLocation();
  const positions = useRef(new Map());
  const catalogPositions = useRef(new Map());
  const previousPath = useRef(null);
  useLayoutEffect(() => {
    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = original; };
  }, []);
  useLayoutEffect(() => {
    const { key, pathname, search } = location;
    const url = pathname + search;
    const returningToCatalog = pathname === '/catalogo' && previousPath.current?.startsWith('/producto/');
    const top = positions.current.get(key) ?? (returningToCatalog
      ? catalogPositions.current.get(url)
      : previousPath.current === pathname ? window.scrollY : 0) ?? 0;
    // Restore before paint: never display the catalog at the top for a frame.
    window.scrollTo({ top, behavior: 'instant' });
    previousPath.current = pathname;
    const remember = () => {
      positions.current.set(key, window.scrollY);
      if (pathname === '/catalogo') catalogPositions.current.set(url, window.scrollY);
    };
    remember();
    window.addEventListener('scroll', remember, { passive: true });
    return () => window.removeEventListener('scroll', remember);
  }, [location]);
  return null;
}

function App() {
  const [products, setProducts] = useState([]);
  const cart = useCart(products);
  const refreshProducts = async () => {
    const fresh = await fetchProducts();
    setProducts(fresh);
    setProductsError('');
    return fresh;
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [user, setUser] = useState({ role: "guest", userName: "" });
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const { showToast } = useToast();

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    // onAuthStateChange incluye INITIAL_SESSION: evita competir con getSession.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(mapSupabaseUser(session?.user));
      setAuthLoading(false);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let active = true;
    fetchProducts().then((items) => {
      if (active) setProducts(items);
    }).catch((error) => {
      if (active) setProductsError(error.message);
    }).finally(() => {
      if (active) setIsLoadingProducts(false);
    });
    return () => { active = false; };
  }, [loadAttempt]);

  const handleSaveProduct = async (payload, editingId) => {
    const saved = editingId ? await updateProduct(editingId, payload) : await createProduct(payload);
    syncPublicProduct(saved);
    return saved;
  };
  const syncPublicProduct = (saved) => setProducts(items => saved.visible
    ? items.some(item => item.id === saved.id) ? items.map(item => item.id === saved.id ? saved : item) : [saved, ...items]
    : items.filter(item => item.id !== saved.id));
  const handleVisibility = async (id, visible) => {
    const saved = await setProductVisibility(id, visible);
    syncPublicProduct(saved);
    return saved;
  };
  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    setProducts((items) => items.filter((item) => item.id !== id));
  };
  const handleLogout = async () => {
    try { await signOut(); }
    catch (error) { showToast(error.message || "No se pudo cerrar sesión.", "error"); }
  };

  return (
    <Router>
      <RouteScroll />
      <div className="min-h-screen bg-ivory text-[#18342d] antialiased">
        <Navbar user={user} onLogout={handleLogout} searchOpen={searchOpen} setSearchOpen={setSearchOpen} cartCount={cart.count} />
        {productsError && <div role="alert" className="catalog-load-error"><p>No pudimos cargar el catálogo. Comprueba tu conexión e inténtalo de nuevo.</p><button type="button" onClick={() => { setProductsError(''); setIsLoadingProducts(true); setLoadAttempt(value => value + 1); }}>Reintentar</button></div>}
        <main className="min-h-[calc(100vh-13rem)]">
          <Routes>
            <Route path="/" element={<Home products={products} isLoading={isLoadingProducts} />} />
            <Route path="/catalogo" element={<Catalog products={products} isLoading={isLoadingProducts} error={productsError} isSearching={searchOpen} />} />
            <Route path="/producto/:id" element={isLoadingProducts ? <p className="p-8" role="status">Cargando producto…</p> : <ProductDetail products={products} error={productsError} cart={cart} />} />
            <Route path="/carrito" element={<Cart cart={cart} products={products} isLoading={isLoadingProducts} error={productsError} refreshProducts={refreshProducts} />} />
            <Route path="/garantias-y-cambios" element={<GuaranteesPage />} />
            <Route path="/auth" element={authLoading ? <p className="p-8" role="status">Comprobando sesión…</p> : <AuthPage onLogin={setUser} user={user} />} />
            <Route path="/admin/productos" element={authLoading ? <p className="p-8" role="status">Comprobando sesión…</p> : user.role === "admin" ? (
              <AdminProductsPage onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} onVisibilityChange={handleVisibility} />
            ) : <Navigate to="/auth" replace />} />
          </Routes>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </Router>
  );
}
export default App;
