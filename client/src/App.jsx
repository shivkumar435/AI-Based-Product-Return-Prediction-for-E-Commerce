import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const PredictionResultPage = lazy(() => import('./pages/PredictionResultPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// New lazy imports
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProductComparisonPage = lazy(() => import('./pages/ProductComparisonPage'));
const CustomerAnalyticsPage = lazy(() => import('./pages/admin/CustomerAnalyticsPage'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const ManageProductsPage = lazy(() => import('./pages/admin/ManageProductsPage'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const ManageOrdersPage = lazy(() => import('./pages/admin/ManageOrdersPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const PredictionReportsPage = lazy(() => import('./pages/admin/PredictionReportsPage'));
const HighRiskPage = lazy(() => import('./pages/admin/HighRiskPage'));

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location} key={location.pathname}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/compare" element={<ProductComparisonPage />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
              <Route path="/prediction-result" element={<ProtectedRoute><PredictionResultPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<ManageProductsPage />} />
              <Route path="users" element={<ManageUsersPage />} />
              <Route path="orders" element={<ManageOrdersPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="predictions" element={<PredictionReportsPage />} />
              <Route path="high-risk" element={<HighRiskPage />} />
              <Route path="customer-analytics" element={<CustomerAnalyticsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export default App;
