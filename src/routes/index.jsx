import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public pages
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CartPage from '../pages/CartPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import MessagesPage from '../pages/MessagesPage';
import NotFoundPage from '../pages/NotFoundPage';

// Protected pages
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import ProfilePage from '../pages/ProfilePage';

// Vendor pages
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorProducts from '../pages/vendor/VendorProducts';
import VendorOrders from '../pages/vendor/VendorOrders';
import VendorOrderDetail from '../pages/vendor/VendorOrderDetail';
import AddProduct from '../pages/vendor/AddProduct';
import EditProduct from '../pages/vendor/EditProduct';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCategories from '../pages/admin/AdminCategories';

// SuperAdmin pages
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import SuperAdminUsers from '../pages/superadmin/SuperAdminUsers';
import SuperAdminSettings from '../pages/superadmin/SuperAdminSettings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // While checking auth, don't redirect yet
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard instead of home
    const roleHome = { vendor: '/vendor', admin: '/admin', superadmin: '/superadmin' };
    return <Navigate to={roleHome[user?.role] || '/'} replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    const roleHome = { superadmin: '/superadmin', admin: '/admin', vendor: '/vendor' };
    return <Navigate to={roleHome[user?.role] || '/'} replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'login',
        element: <PublicRoute><LoginPage /></PublicRoute>,
      },
      {
        path: 'register',
        element: <PublicRoute><RegisterPage /></PublicRoute>,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute allowedRoles={['client', 'vendor', 'admin', 'superadmin']}>
            <MessagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute allowedRoles={['client', 'vendor', 'admin', 'superadmin']}>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute allowedRoles={['client', 'vendor', 'admin', 'superadmin']}>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute allowedRoles={['client', 'vendor', 'admin', 'superadmin']}>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['client', 'vendor', 'admin', 'superadmin']}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      // 404 inside main layout
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/vendor',
    element: (
      <ProtectedRoute allowedRoles={['vendor']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <VendorDashboard /> },
      { path: 'products', element: <VendorProducts /> },
      { path: 'products/add', element: <AddProduct /> },
      { path: 'products/edit/:id', element: <EditProduct /> },
      { path: 'orders', element: <VendorOrders /> },
      { path: 'orders/:id', element: <VendorOrderDetail /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'categories', element: <AdminCategories /> },
    ],
  },
  {
    path: '/superadmin',
    element: (
      <ProtectedRoute allowedRoles={['superadmin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: 'users', element: <SuperAdminUsers /> },
      { path: 'settings', element: <SuperAdminSettings /> },
    ],
  },
  // Global 404
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
