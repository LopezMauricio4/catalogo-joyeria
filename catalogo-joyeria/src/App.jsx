import { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import AuthPage from "./pages/AuthPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import { createProduct, deleteProduct, fetchProducts } from "./services/productApi";
import { mapSupabaseUser, signOut } from "./services/authApi";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

const PRODUCTS_STORAGE_KEY = "alpez-products";

function App() {
  const [products, setProducts] = useState(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return storedProducts ? JSON.parse(storedProducts) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [user, setUser] = useState({ role: "guest", userName: "" });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => setUser(mapSupabaseUser(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const apiProducts = await fetchProducts();
        if (isMounted) {
          setProducts(apiProducts);
        }
      } catch (error) {
        console.error("No se pudo cargar el catálogo desde la API:", error);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const handleSaveProduct = async (productPayload) => {
    if (productPayload instanceof FormData) {
      try {
        const savedProduct = await createProduct(productPayload);
        setProducts((currentProducts) => [savedProduct, ...currentProducts.filter((item) => item.id !== savedProduct.id)]);
        return;
      } catch (error) {
        console.error("Error al guardar el producto:", error);
        return;
      }
    }

    setProducts((currentProducts) => {
      const existingIndex = currentProducts.findIndex((item) => item.id === productPayload.id);

      if (existingIndex >= 0) {
        const updatedProducts = [...currentProducts];
        updatedProducts[existingIndex] = productPayload;
        return updatedProducts;
      }

      return [productPayload, ...currentProducts];
    });
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error al borrar el producto:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Router>
      <div className="min-h-screen bg-ivory text-[#18342d] antialiased">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="min-h-[calc(100vh-13rem)]">
          <Routes>
            <Route path="/" element={<Home products={products} />} />
            <Route path="/catalogo" element={<Catalog products={products} isLoading={isLoadingProducts} />} />
            <Route path="/producto/:id" element={<ProductDetail products={products} />} />
            <Route path="/auth" element={<AuthPage onLogin={setUser} user={user} />} />
            <Route
              path="/admin/productos"
              element={
                user.role === "admin" ? (
                  <AdminProductsPage
                    products={products}
                    onSaveProduct={handleSaveProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
          </Routes>
        </main>

        <Footer />
        <FloatingWhatsApp />
      </div>
    </Router>
  );
}

export default App;
