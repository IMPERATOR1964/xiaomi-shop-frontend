import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieNotice from './components/CookieNotice';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import ComparePage from './pages/ComparePage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import './styles/global.css';
import './styles/reviews.css';
import './styles/ui-states.css';
import './styles/orders.css';
import './styles/admin.css';

export default function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/"                     element={<HomePage />} />
          <Route path="/catalog"              element={<CatalogPage />} />
          <Route path="/catalog/:category"    element={<CatalogPage />} />
          <Route path="/product/:id"          element={<ProductPage />} />
          <Route path="/cart"                 element={<CartPage />} />
          <Route path="/checkout"             element={<CheckoutPage />} />
          <Route path="/orders"               element={<OrdersPage />} />
          <Route path="/orders/:id"           element={<OrderDetailPage />} />
          <Route path="/favorites"            element={<FavoritesPage />} />
          <Route path="/compare"              element={<ComparePage />} />
          <Route path="/login"                element={<LoginPage />} />
          <Route path="/register"             element={<RegisterPage />} />
          <Route path="/verify-email"         element={<VerifyEmailPage />} />
          <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
          <Route path="/reset-password"       element={<ResetPasswordPage />} />
          <Route path="/profile"              element={<ProfilePage />} />

          {/* Админка — только для ADMIN/MODERATOR (защищено в AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                  element={<AdminDashboardPage />} />
            <Route path="products"        element={<AdminProductsPage />} />
            <Route path="products/new"    element={<AdminProductFormPage />} />
            <Route path="products/:id"    element={<AdminProductFormPage />} />
            <Route path="orders"          element={<AdminOrdersPage />} />
            <Route path="categories"      element={<AdminCategoriesPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <CookieNotice />
      <ToastContainer />
    </div>
  );
}
