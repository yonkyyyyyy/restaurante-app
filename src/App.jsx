import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';

// Componentes de Layout
import Layout from './components/Layout/Layout';
import Login from './pages/Login';

// Páginas principales
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import OrderLinkGenerator from './pages/OrderLinkGenerator';
import CustomerMenu from './pages/CustomerMenu';
import Reports from './pages/Reports';

// Componente para rutas protegidas
function ProtectedRoute({ children, requiredRole = null }) {
  const { state, actions } = useAuth();
  
  if (state.loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid transparent',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && !actions.hasPermission(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Componente principal de la aplicación
function AppContent() {
  const { state } = useAuth();
  
  return (
    <Routes>
      {/* Rutas públicas (sin autenticación) */}
      <Route path="/menu/:tableId" element={<CustomerMenu />} />
      
      {!state.isAuthenticated ? (
        <Route path="*" element={
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        } />
      ) : (
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/menu" element={
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/order-links" element={
                <ProtectedRoute requiredRole="embalador">
                  <OrderLinkGenerator />
                </ProtectedRoute>
              } />
              <Route path="/billing" element={
                <ProtectedRoute requiredRole="cajero">
                  <Billing />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute requiredRole="cajero">
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute requiredRole="admin">
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute requiredRole="admin">
                  <Employees />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />
      )}
    </Routes>
  );
}

// Componente raíz
function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <Router>
          <div style={{
            minHeight: '100vh',
            background: '#f5f7fa'
          }}>
            <AppContent />
          </div>
        </Router>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;