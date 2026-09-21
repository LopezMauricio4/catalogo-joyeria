import { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import AuthPage from "./pages/AuthPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import { createProduct, updateProduct, deleteProduct, fetchProducts } from "./services/productApi";
import { mapSupabaseUser, signOut } from "./services/authApi";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { useToast } from "./hooks/useToast";
import useCart from './hooks/useCart';
import Cart from './pages/Cart';
import GuaranteesPage from "./pages/GuaranteesPage";

function StoreFooter() {
  const { pathname } = useLocation();
  return pathname.startsWith('/producto/') ? null : <Footer />;
}

function RouteScroll() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
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
    setProducts((items) => editingId
      ? items.map((item) => item.id === saved.id ? saved : item)
      : [saved, ...items]);
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
              <AdminProductsPage products={products} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />
            ) : <Navigate to="/auth" replace />} />
          </Routes>
        </main>
        <StoreFooter />
        <FloatingWhatsApp />
      </div>
    </Router>
  );
}
export default App;
