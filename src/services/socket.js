// =====================================================
// SOCKET SERVICE - Conexión WebSocket con Socket.IO
// Maneja todos los 12 eventos del sistema
// =====================================================

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Eventos del servidor
export const SOCKET_EVENTS = {
  // Presencia
  PRESENCE_UPDATE: 'presenceUpdate',
  
  // Chat events
  NEW_MESSAGE: 'newMessage',
  NEW_CHAT: 'newChat',
  ASSIGNED_CHAT: 'assignedChat',
  RELEASED_CHAT: 'releasedChat',
  FINALIZED_CHAT: 'finalizedChat',
  MESSAGES_READ: 'messagesRead',
  NEW_INTERNAL_NOTE: 'chat:newInternalNote',
  
  // Admin events
  ADMIN_QR: 'admin:qr',
  ADMIN_STATUS: 'admin:status',
  
  // Personal notification
  ASSIGNMENT_NOTIFICATION: 'assignment-notification',
  
  // Dashboard
  DASHBOARD_SURVEY_UPDATE: 'dashboard:surveyUpdate',
};

class SocketService {
  // S7757: Campos declarados a nivel de clase
  socket = null;
  listeners = new Map();
  reconnectAttempts = 0;
  maxReconnectAttempts = 10;

  // Conectar al servidor
  connect(token) {
    if (this.socket?.connected) {
      console.log('[Socket] Ya conectado');
      return this.socket;
    }

    console.log('[Socket] Conectando...');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('[Socket] ✅ Conectado:', this.socket.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] ❌ Desconectado:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] ♻️ Reconectado después de', attemptNumber, 'intentos');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[Socket] Error de reconexión:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Falló la reconexión después de', this.maxReconnectAttempts, 'intentos');
    });

    return this.socket;
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      console.log('[Socket] Desconectando...');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Verificar conexión
  isConnected() {
    return this.socket?.connected || false;
  }

  // Obtener socket
  getSocket() {
    return this.socket;
  }

  // Suscribirse a evento
  on(event, callback) {
    if (!this.socket) {
      console.warn('[Socket] No conectado, no se puede suscribir a:', event);
      return () => {};
    }

    // Guardar listener
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Suscribir
    this.socket.on(event, callback);

    // Retornar función de cleanup
    return () => this.off(event, callback);
  }

  // Desuscribirse de evento
  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Emitir evento
  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('[Socket] No conectado, no se puede emitir:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  // Limpiar todos los listeners
  removeAllListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((_, event) => {
      this.socket.off(event);
    });
    this.listeners.clear();
  }
}

// Exportar instancia única
export const socketService = new SocketService();
export default socketService;