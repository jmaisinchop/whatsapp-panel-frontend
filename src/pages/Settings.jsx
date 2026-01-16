// =====================================================
// SETTINGS PAGE - Configuración del sistema (Solo Admin)
// =====================================================

import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Spinner } from '../components/Loading';
import {
  Settings as SettingsIcon,
  Smartphone,
  QrCode,
  RefreshCw,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Camera,
  Bot,
  Users,
  Database
} from 'lucide-react';
import './Settings.css';

export default function SettingsPage() {
  const { whatsappStatus, qrCode, connectedAgents, subscribe } = useSocket();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [botProfile, setBotProfile] = useState(null);
  const [health, setHealth] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Cargar datos iniciales
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

    // Escuchar actualizaciones de estado
    const unsubStatus = subscribe('admin:status', (data) => {
      setHealth(prev => ({ ...prev, status: data.status }));
    });

    return () => {
      unsubStatus();
    };
  }, [subscribe]);

  // Refrescar estado
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cerrar sesión de WhatsApp
  const handleLogout = async () => {
    if (!confirm('¿Seguro que deseas cerrar la sesión de WhatsApp? Necesitarás escanear el QR nuevamente.')) {
      return;
    }

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

  // Subir foto de perfil
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

  // Invalidar caché
  const handleInvalidateCache = async () => {
    try {
      await api.invalidateCache();
      success('Caché invalidado correctamente');
    } catch (err) {
      showError(err.message || 'Error al invalidar caché');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'connected': { 
        label: 'Conectado', 
        class: 'status-connected',
        icon: CheckCircle,
        color: 'var(--success)'
      },
      'disconnected': { 
        label: 'Desconectado', 
        class: 'status-disconnected',
        icon: XCircle,
        color: 'var(--error)'
      },
      'awaiting_qr': { 
        label: 'Esperando QR', 
        class: 'status-pending',
        icon: QrCode,
        color: 'var(--warning)'
      },
      'connecting': { 
        label: 'Conectando...', 
        class: 'status-pending',
        icon: RefreshCw,
        color: 'var(--info)'
      },
    };
    return configs[status] || configs['disconnected'];
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <Spinner size="lg" />
        <p>Cargando configuración...</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(whatsappStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>Configuración</h1>
          <p>Administra WhatsApp y el sistema</p>
        </div>
        <button 
          className="btn-outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <div className="settings-grid">
        {/* WhatsApp Status Card */}
        <div className="settings-card card">
          <div className="card-header">
            <h3>
              <Smartphone size={20} />
              Estado de WhatsApp
            </h3>
          </div>
          <div className="card-body">
            <div className={`whatsapp-status-display ${statusConfig.class}`}>
              <StatusIcon size={48} style={{ color: statusConfig.color }} />
              <span className="status-label">{statusConfig.label}</span>
            </div>

            {/* QR Code */}
            {whatsappStatus === 'awaiting_qr' && qrCode && (
              <div className="qr-container">
                <p>Escanea el código QR con WhatsApp:</p>
                <div className="qr-code">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                    alt="QR Code"
                  />
                </div>
                <span className="qr-hint">
                  Abre WhatsApp → Menú → Dispositivos vinculados → Vincular dispositivo
                </span>
              </div>
            )}

            {/* Health Info */}
            {health && (
              <div className="health-info">
                <div className="health-item">
                  <span className="health-label">Uptime</span>
                  <span className="health-value">{health.uptime || 'N/A'}</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Última actividad</span>
                  <span className="health-value">
                    {health.lastActivity 
                      ? new Date(health.lastActivity).toLocaleString('es')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            {whatsappStatus === 'connected' && (
              <div className="card-actions">
                <button 
                  className="btn-danger"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? <Spinner size="sm" /> : <LogOut size={18} />}
                  Cerrar sesión WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bot Profile Card */}
        <div className="settings-card card">
          <div className="card-header">
            <h3>
              <Bot size={20} />
              Perfil del Bot
            </h3>
          </div>
          <div className="card-body">
            <div className="bot-profile">
              <div className="bot-avatar">
                {/* CORREGIDO: Usar profilePicUrl en lugar de profilePicture */}
                {botProfile?.profilePicUrl ? (
                  <img src={botProfile.profilePicUrl} alt="Bot" />
                ) : (
                  <Bot size={32} />
                )}
                <label className="avatar-upload">
                  <Camera size={16} />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProfilePicture}
                    hidden
                  />
                </label>
              </div>
              <div className="bot-info">
                <h4>{botProfile?.name || 'Kika'}</h4>
                {/* CORREGIDO: Usar number en lugar de phoneNumber */}
                <p>{botProfile?.number || 'Sin número'}</p>
              </div>
            </div>

            <div className="bot-stats">
              <div className="bot-stat">
                <span className="stat-number">{botProfile?.totalChats || 0}</span>
                <span className="stat-label">Chats totales</span>
              </div>
              <div className="bot-stat">
                <span className="stat-number">{botProfile?.activeChats || 0}</span>
                <span className="stat-label">Chats activos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Agents Card */}
        <div className="settings-card card">
          <div className="card-header">
            <h3>
              <Users size={20} />
              Agentes Conectados
            </h3>
            <span className="badge badge-primary">{connectedAgents.length}</span>
          </div>
          <div className="card-body">
            {connectedAgents.length === 0 ? (
              <div className="empty-agents">
                <WifiOff size={32} />
                <p>No hay agentes conectados</p>
              </div>
            ) : (
              <div className="agents-list">
                {connectedAgents.map((agent, index) => (
                  <div key={index} className="agent-item">
                    <div className="agent-avatar">
                      {agent.firstName?.[0] || agent.email?.[0] || 'A'}
                    </div>
                    <div className="agent-details">
                      <span className="agent-name">
                        {agent.firstName} {agent.lastName}
                      </span>
                      <span className="agent-email">{agent.email}</span>
                    </div>
                    <span className="agent-online">
                      <Wifi size={14} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Card */}
        <div className="settings-card card">
          <div className="card-header">
            <h3>
              <Database size={20} />
              Sistema
            </h3>
          </div>
          <div className="card-body">
            <div className="system-info">
              <div className="system-item">
                <span className="system-label">Versión</span>
                <span className="system-value">1.0.0</span>
              </div>
              <div className="system-item">
                <span className="system-label">Entorno</span>
                <span className="system-value">Producción</span>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn-outline"
                onClick={handleInvalidateCache}
              >
                <RefreshCw size={18} />
                Limpiar Caché
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}