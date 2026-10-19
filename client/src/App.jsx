import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import Onboarding from './pages/onboarding/Onboarding';
import Dashboard from './pages/dashboard/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import ProductList from './pages/products/ProductList';
import OrderList from './pages/orders/OrderList';
import InvoiceList from './pages/invoices/InvoiceList';
import Analytics from './pages/analytics/Analytics';
import AIAssistant from './pages/ai/AIAssistant';
import AIReports from './pages/ai/AIReports';
import AIContentGenerator from './pages/ai/AIContentGenerator';
import TeamManagement from './pages/team/TeamManagement';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LandingPage from './pages/landing/LandingPage';

// Role Guard Component
const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
              </Route>

              {/* Super Admin Master Platform Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Onboarding Flow */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Protected Workspace Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/invoices" element={<InvoiceList />} />
                <Route
                  path="/analytics"
                  element={
                    <RoleRoute allowedRoles={['owner', 'manager']}>
                      <Analytics />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <RoleRoute allowedRoles={['owner', 'manager']}>
                      <AIAssistant />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/ai-reports"
                  element={
                    <RoleRoute allowedRoles={['owner', 'manager']}>
                      <AIReports />
                    </RoleRoute>
                  }
                />
                <Route path="/ai-content" element={<AIContentGenerator />} />
                <Route
                  path="/team"
                  element={
                    <RoleRoute allowedRoles={['owner', 'manager']}>
                      <TeamManagement />
                    </RoleRoute>
                  }
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
