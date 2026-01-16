// =====================================================
// APP.JSX - Componente principal con rutas
// =====================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { LoadingScreen } from './components/Loading';

// Layout
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import ChatsPage from './pages/Chats';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';

// Protected Route Component
function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles si se especifican
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  return (
    <ProtectedRoute roles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatProvider>
              <Layout />
            </ChatProvider>
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Chats */}
        <Route path="chats" element={<ChatsPage />} />

        {/* Users (Admin only) */}
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />

        {/* Settings (Admin only) */}
        <Route
          path="settings"
          element={
            <AdminRoute>
              <SettingsPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 - Redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
