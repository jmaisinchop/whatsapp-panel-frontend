import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Spinner } from '../components/Loading';
import { Avatar } from '../components/common';
import {
  Smartphone, QrCode, RefreshCw, LogOut, CheckCircle, XCircle,
  WifiOff, Camera, Bot, Users, Database, Activity,
  ShieldCheck, Clock, HardDrive
} from 'lucide-react';

export default function SettingsPage() {
  const { whatsappStatus, qrCode, connectedAgents, subscribe } = useSocket();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [botProfile, setBotProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadData = async () => {
    try {
      const [profileData, healthData] = await Promise.all([
        api.getBotProfile().catch(() => null),
        api.getWhatsAppHealth().catch(() => null),
      ]);
      setBotProfile(profileData);
      setHealth(healthData);
    } catch (err) {
      console.error('Error cargando configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubStatus = subscribe('admin:status', (data) => {
      setHealth(prev => ({ ...prev, status: data.status }));
    });
    return () => unsubStatus?.();
  }, [subscribe]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    if (!confirm('¿Seguro que deseas cerrar la sesión de WhatsApp? Deberás escanear el QR nuevamente.')) return;
    setLoggingOut(true);
    try {
      await api.logoutWhatsApp();
      success('Sesión de WhatsApp cerrada');
      loadData();
    } catch (err) {
      showError(err.message || 'Error al cerrar sesión');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError('Solo se permiten imágenes');
      return;
    }
    try {
      await api.uploadProfilePicture(file);
      success('Foto de perfil actualizada');
      loadData();
    } catch (err) {
      showError(err.message || 'Error al subir imagen');
    }
  };

  const handleInvalidateCache = async () => {
    try {
      await api.invalidateCache();
      success('Caché del sistema limpiado');
    } catch (err) {
      showError(err.message || 'Error al limpiar caché');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'connected': { label: 'Conectado', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      'disconnected': { label: 'Desconectado', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
      'awaiting_qr': { label: 'Esperando QR', icon: QrCode, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
      'connecting': { label: 'Conectando...', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    };
    return configs[status] || configs['disconnected'];
  };

  const renderConnectionState = () => {
    if (whatsappStatus === 'connected') {
      return (
        <div className="text-center space-y-6 animate-in zoom-in duration-300 w-full max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-50">
            <ShieldCheck size={40} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Servicio Sincronizado</h3>
            <p className="text-slate-500 text-sm mt-2">
              Kika está conectada y procesando mensajes correctamente.
            </p>
          </div>
          
          {health && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Uptime</span>
                <div className="flex items-center justify-center gap-2 text-slate-700 font-mono font-medium">
                  <Clock size={14} /> {health.uptime || '00:00:00'}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">Última Actividad</span>
                <div className="flex items-center justify-center gap-2 text-slate-700 font-mono font-medium">
                  <Activity size={14} /> 
                  {health.lastActivity ? new Date(health.lastActivity).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (whatsappStatus === 'awaiting_qr' && qrCode) {
      return (
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCode)}`}
              alt="QR Code" 
              className="w-56 h-56 object-contain mix-blend-multiply" 
            />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Escanea el código QR</h3>
            <p className="text-slate-500 text-sm">Abre WhatsApp &gt; Dispositivos vinculados &gt; Vincular</p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-4">
        <Spinner size="xl" className="border-blue-500" />
        <p className="text-slate-500 font-medium">Estableciendo conexión con el servidor...</p>
      </div>
    );
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const statusConfig = getStatusConfig(whatsappStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración</h1>
            <p className="text-slate-500 text-sm mt-1">Administra la conexión de WhatsApp, el perfil del bot y el sistema.</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all text-sm font-medium shadow-sm active:scale-95"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Actualizar Datos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. WHATSAPP CONNECTION CARD */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Smartphone size={20} className="text-blue-500" /> Estado de WhatsApp
              </h2>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                <StatusIcon size={14} className={whatsappStatus === 'connecting' ? 'animate-spin' : ''} />
                {statusConfig.label}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {renderConnectionState()}
            </div>

            {whatsappStatus === 'connected' && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-medium shadow-sm hover:shadow"
                >
                  {loggingOut ? <Spinner size="sm" className="border-rose-600" /> : <LogOut size={16} />}
                  Cerrar Sesión WhatsApp
                </button>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-6">
            
            {/* 2. BOT PROFILE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Bot size={16} /> Perfil del Bot
                </h3>
              </div>
              <div className="p-6 flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-md bg-slate-100">
                    {botProfile?.profilePicUrl ? (
                      <img src={botProfile.profilePicUrl} alt="Bot" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                         <Bot size={40} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95">
                    <Camera size={14} />
                    <input type="file" accept="image/*" onChange={handleProfilePicture} hidden />
                  </label>
                </div>
                
                <h4 className="text-lg font-bold text-slate-800">{botProfile?.name || 'Kika Bot'}</h4>
                <p className="text-slate-500 text-sm font-mono mb-6">{botProfile?.number || 'Sin número'}</p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <span className="block text-2xl font-bold text-blue-700">{botProfile?.totalChats || 0}</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Chats Totales</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <span className="block text-2xl font-bold text-emerald-700">{botProfile?.activeChats || 0}</span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Activos Ahora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CONNECTED AGENTS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Users size={16} /> Agentes Online
                </h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{connectedAgents.length}</span>
              </div>
              <div className="p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {connectedAgents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <WifiOff size={24} className="mb-2 opacity-50" />
                    <p className="text-xs">No hay agentes conectados</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {connectedAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="relative">
                          <Avatar name={agent.firstName} size="sm" />
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{agent.firstName} {agent.lastName}</p>
                          <p className="text-xs text-slate-400 truncate">{agent.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. SYSTEM ACTIONS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                   <Database size={16} /> Sistema
                 </h3>
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                     <span className="text-slate-500">Versión</span>
                     <span className="font-mono font-medium text-slate-700">v1.0.0 (Prod)</span>
                  </div>
                  <button 
                    onClick={handleInvalidateCache}
                    className="w-full flex items-center justify-center gap-2 p-2.5 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all text-sm font-medium"
                  >
                     <HardDrive size={16} /> Limpiar Caché del Servidor
                  </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}