import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Avatar } from './common';
import {
  LayoutDashboard, MessageSquare, Users, Settings, LogOut, Menu, X, MessageCircle
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { isConnected, whatsappStatus } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'agent'] },
    { path: '/chats', icon: MessageSquare, label: 'Chats', roles: ['admin', 'agent'] },
    { path: '/users', icon: Users, label: 'Usuarios', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'Configuración', roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity w-full h-full border-none cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/30">
          <div className="bg-blue-600/20 p-2 rounded-xl">
            <MessageCircle size={22} className="text-blue-500" />
          </div>
          <span className="font-bold text-lg tracking-wide text-slate-100">Kika Panel</span>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menú Principal</div>
          {visibleItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}
              `}
            >
              <item.icon size={20} className={({ isActive }) => isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-4 mb-4 px-2 text-[11px] font-medium tracking-wide uppercase text-slate-500">
            <div className={`flex items-center gap-1.5 ${isConnected ? "text-emerald-400" : "text-rose-400"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"}`} />
              Socket
            </div>
            <div className={`flex items-center gap-1.5 ${whatsappStatus === 'connected' ? "text-emerald-400" : "text-amber-400"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${whatsappStatus === 'connected' ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              WhatsApp
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar name={user?.firstName || user?.email} size="sm" className="bg-blue-600 ring-2 ring-slate-700" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-200 truncate leading-tight group-hover:text-white">
                  {user?.firstName || 'Usuario'}
                </span>
                <span className="text-xs text-slate-400 capitalize truncate">{user?.role}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative">
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800">Kika Panel</span>
          <Avatar name={user?.firstName} size="sm" />
        </header>

        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}