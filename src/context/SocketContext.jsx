// =====================================================
// SOCKET CONTEXT - Conexión WebSocket global
// =====================================================

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import socketService, { SOCKET_EVENTS } from '../services/socket';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated, user } = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAgents, setConnectedAgents] = useState([]);
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  
  const cleanupRef = useRef([]);

  // Conectar/desconectar según autenticación
  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = socketService.connect(token);

      // Evento de conexión
      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);
      
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);

      // Presencia de agentes
      socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (agents) => {
        setConnectedAgents(agents || []);
      });

      // Estado de WhatsApp
      socket.on(SOCKET_EVENTS.ADMIN_STATUS, (data) => {
        setWhatsappStatus(data.status || 'disconnected');
        if (data.status === 'connected') {
          setQrCode(null);
        }
      });

      // QR Code
      socket.on(SOCKET_EVENTS.ADMIN_QR, (qr) => {
        setQrCode(qr);
        setWhatsappStatus('awaiting_qr');
      });

      // Cleanup
      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off(SOCKET_EVENTS.PRESENCE_UPDATE);
        socket.off(SOCKET_EVENTS.ADMIN_STATUS);
        socket.off(SOCKET_EVENTS.ADMIN_QR);
        socketService.disconnect();
        setIsConnected(false);
        setConnectedAgents([]);
      };
    } else {
      socketService.disconnect();
      setIsConnected(false);
      setConnectedAgents([]);
      setQrCode(null);
    }
  }, [isAuthenticated, token]);

  // Suscribirse a evento
  const subscribe = useCallback((event, callback) => {
    return socketService.on(event, callback);
  }, []);

  // Desuscribirse
  const unsubscribe = useCallback((event, callback) => {
    socketService.off(event, callback);
  }, []);

  // Emitir evento
  const emit = useCallback((event, data) => {
    socketService.emit(event, data);
  }, []);

  const value = {
    isConnected,
    connectedAgents,
    whatsappStatus,
    qrCode,
    subscribe,
    unsubscribe,
    emit,
    socket: socketService.getSocket(),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
}

export { SOCKET_EVENTS };
export default SocketContext;
