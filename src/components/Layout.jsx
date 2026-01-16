// =====================================================
// LAYOUT - Estructura principal de la aplicación
// =====================================================

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// CORRECCIÓN 1: Un solo punto ".." para ir a src/context
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
// CORRECCIÓN 2: Importar desde "./common" (mismo directorio) en lugar de "../common"
import { Avatar, StatusDot } from './common';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  MessageCircle,
} from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { isConnected, whatsappStatus, connectedAgents } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Items de navegación
  const navItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      roles: ['admin', 'agent']
    },
    { 
      path: '/chats', 
      icon: MessageSquare, 
      label: 'Chats',
      roles: ['admin', 'agent']
    },
    { 
      path: '/users', 
      icon: Users, 
      label: 'Usuarios',
      roles: ['admin']
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'Configuración',
      roles: ['admin']
    },
  ];

  // Filtrar según rol
  const visibleItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo">
            <MessageCircle size={28} />
            <span>Kika Panel</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Connection Status */}
          <div className="connection-info">
            <div className={`status-item ${isConnected ? 'online' : 'offline'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
            <div className={`status-item wa-${whatsappStatus}`}>
              <StatusDot status={whatsappStatus === 'connected' ? 'online' : 'error'} />
              <span>WhatsApp: {whatsappStatus === 'connected' ? 'OK' : 'Off'}</span>
            </div>
            {connectedAgents.length > 0 && (
              <div className="status-item agents">
                <Users size={14} />
                <span>{connectedAgents.length} agente{connectedAgents.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="user-info">
            <Avatar 
              name={user?.firstName || user?.email} 
              size="md"
              color="#0066FF"
            />
            <div className="user-details">
              <span className="user-name">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Header móvil */}
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="header-title">Kika Panel</span>
          <Avatar 
            name={user?.firstName || user?.email} 
            size="sm"
            color="#0066FF"
          />
        </header>

        {/* Page Content */}
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}