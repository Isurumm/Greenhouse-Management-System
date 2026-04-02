import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import Inventory from './pages/admin/Inventory';
import Polytunnels from './pages/admin/Polytunnels';
import Orders from './pages/admin/Orders';
import Deliveries from './pages/admin/Deliveries';
import Users from './pages/admin/Users';

// Customer Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';

// Error Pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';
import { ADMIN_AREA_ROLES, ADMIN_MODULE_ROLES, ALL_AUTH_ROLES } from './constants/roleAccess';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
            </Route>

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
                  <Route path="/dashboard" element={<ProtectedRoute allowedRoles={ALL_AUTH_ROLES} />}>
                     <Route index element={<DashboardRedirect />} />
                  </Route>

            {/* Customer Application Routes */}
            <Route path="/" element={<CustomerLayout />}>
               <Route index element={<Home />} />
               <Route path="shop" element={<Shop />} />
               <Route path="about" element={<AboutUs />} />
               <Route path="contact" element={<ContactUs />} />
               <Route path="product/:id" element={<ProductDetails />} />
               <Route path="cart" element={<Cart />} />
               <Route path="checkout" element={<Checkout />} />
               <Route path="profile" element={<Profile />} />
               <Route path="orders" element={<MyOrders />} />
            </Route>

            {/* Admin Application Routes (Protected) */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={ADMIN_AREA_ROLES} />}>
               <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  
                  {/* Module routes (Protected specifically) */}
                  <Route path="polytunnels" element={<ProtectedRoute allowedRoles={ADMIN_MODULE_ROLES.polytunnels} />}>
                     <Route index element={<Polytunnels />} />
                  </Route>

                  <Route path="inventory" element={<ProtectedRoute allowedRoles={ADMIN_MODULE_ROLES.inventory} />}>
                     <Route index element={<Inventory />} />
                  </Route>

                  <Route path="orders" element={<ProtectedRoute allowedRoles={ADMIN_MODULE_ROLES.orders} />}>
                     <Route index element={<Orders />} />
                  </Route>

                  <Route path="deliveries" element={<ProtectedRoute allowedRoles={ADMIN_MODULE_ROLES.deliveries} />}>
                     <Route index element={<Deliveries />} />
                  </Route>

                  <Route path="users" element={<ProtectedRoute allowedRoles={ADMIN_MODULE_ROLES.users} />}>
                     <Route index element={<Users />} />
                  </Route>
               </Route>
            </Route>

            {/* Catch All non-matching routes */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
