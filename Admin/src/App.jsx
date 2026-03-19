import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { VendorAuthProvider } from './context/VendorAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import VendorProtectedRoute from './components/VendorProtectedRoute';
import Layout from './components/Layout';
import VendorLayout from './components/VendorLayout';
import Login from './pages/Login';
import VendorLogin from './pages/VendorLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Orders from './pages/Orders';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorCategories from './pages/vendor/VendorCategories';
import VendorProfile from './pages/vendor/VendorProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <VendorAuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/vendor-login" element={<VendorLogin />} />
              <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
              <Route path="/vendor/dashboard" element={<VendorProtectedRoute><VendorLayout><VendorDashboard /></VendorLayout></VendorProtectedRoute>} />
              <Route path="/vendor/products" element={<VendorProtectedRoute><VendorLayout><VendorProducts /></VendorLayout></VendorProtectedRoute>} />
              <Route path="/vendor/orders" element={<VendorProtectedRoute><VendorLayout><VendorOrders /></VendorLayout></VendorProtectedRoute>} />
              <Route path="/vendor/categories" element={<VendorProtectedRoute><VendorLayout><VendorCategories /></VendorLayout></VendorProtectedRoute>} />
              <Route path="/vendor/profile" element={<VendorProtectedRoute><VendorLayout><VendorProfile /></VendorLayout></VendorProtectedRoute>} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Customers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendors"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Vendors />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Products />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Categories />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Orders />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          </VendorAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

