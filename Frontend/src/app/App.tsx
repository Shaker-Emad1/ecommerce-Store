import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { CartProvider } from "../store/cartContext";
import { AuthProvider } from "../store/authContext";
import { StoreLayout } from "../components/layouts/StoreLayout";
import { ErrorBoundary } from "../components/shared/ErrorBoundary";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { AdministratorLayout } from "../components/layouts/AdministratorLayout";

const HomePage = lazy(() => import("../pages/HomePage").then(m => ({ default: m.HomePage })));
const CategoriesPage = lazy(() => import("../pages/CategoriesPage").then(m => ({ default: m.CategoriesPage })));
const ProductsPage = lazy(() => import("../pages/ProductsPage").then(m => ({ default: m.ProductsPage })));
const ProductDetailsPage = lazy(() => import("../pages/ProductDetailsPage").then(m => ({ default: m.ProductDetailsPage })));
const CartPage = lazy(() => import("../pages/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const SuccessPage = lazy(() => import("../pages/SuccessPage").then(m => ({ default: m.SuccessPage })));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage").then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F0F0F" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4 mx-auto" style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }} />
        <p className="text-gray-500 text-sm" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<AppLoader />}>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="product/:id" element={<ProductDetailsPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="success" element={<SuccessPage />} />
                </Route>
                <Route path="administrator/login" element={<AdministratorLayout><AdminLoginPage /></AdministratorLayout>} />
                <Route path="administrator/*" element={<AdministratorLayout><ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute></AdministratorLayout>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}
