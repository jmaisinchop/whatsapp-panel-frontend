// =====================================================
// CHAT CONTEXT - Manejo de chats en tiempo real
// =====================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSocket, SOCKET_EVENTS } from './SocketContext';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { subscribe, isConnected } = useSocket();
  const { success, info, warning } = useToast();
  const { user } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const currentChatRef = useRef(currentChat);
  
  // Mantener ref actualizado
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // Cargar lista de chats
  const loadChats = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getChats(page, pagination.limit);
      
      setChats(response.data || []);
      setPagination({
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 50,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 0,
      });
    } catch (error) {
      console.error('Error cargando chats:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Cargar chat específico con mensajes
  const loadChat = useCallback(async (chatId) => {
    try {
      setLoading(true);
      const chat = await api.getChat(chatId);
      setCurrentChat(chat);
      return chat;
    } catch (error) {
      console.error('Error cargando chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar mensaje de texto
  const sendMessage = useCallback(async (chatId, content) => {
    try {
      const message = await api.sendMessage(chatId, content);
      return message;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }, []);

  // Enviar archivo multimedia
  const sendMedia = useCallback(async (chatId, file, caption = '') => {
    try {
      const message = await api.sendMedia(chatId, file, caption);
      return message;
    } catch (error) {
      console.error('Error enviando archivo:', error);
      throw error;
    }
  }, []);

  // Marcar chat como leído
  const markAsRead = useCallback(async (chatId) => {
    try {
      await api.markChatAsRead(chatId);
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Error marcando como leído:', error);
    }
  }, []);

  // Asignar chat (a mí o a otro agente)
  const assignChat = useCallback(async (chatId, agentId = null) => {
    try {
      const chat = await api.assignChat(chatId, agentId);
      success('Chat asignado correctamente');
      return chat;
    } catch (error) {
      console.error('Error asignando chat:', error);
      throw error;
    }
  }, [success]);

  // Liberar chat (envía encuesta)
  const releaseChat = useCallback(async (chatId) => {
    try {
      const chat = await api.releaseChat(chatId);
      success('Chat liberado');
      return chat;
    } catch (error) {
      console.error('Error liberando chat:', error);
      throw error;
    }
  }, [success]);

  // Desasignar chat (solo admin, sin encuesta)
  const unassignChat = useCallback(async (chatId) => {
    try {
      const chat = await api.unassignChat(chatId);
      success('Chat desasignado');
      return chat;
    } catch (error) {
      console.error('Error desasignando chat:', error);
      throw error;
    }
  }, [success]);

  // Crear nota interna
  const createNote = useCallback(async (chatId, content) => {
    try {
      const note = await api.createNote(chatId, content);
      return note;
    } catch (error) {
      console.error('Error creando nota:', error);
      throw error;
    }
  }, []);

  // =====================================================
  // SOCKET EVENTS - Tiempo real
  // =====================================================

  useEffect(() => {
    if (!isConnected) return;

    const cleanups = [];

    // Nuevo mensaje
    cleanups.push(subscribe(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
      const { chatId, message } = data;
      
      // Actualizar chat actual si corresponde
      if (currentChatRef.current?.id === chatId) {
        setCurrentChat(prev => ({
          ...prev,
          messages: [...(prev?.messages || []), message],
        }));
      }

      // Actualizar lista de chats
      setChats(prev => {
        const index = prev.findIndex(c => c.id === chatId);
        if (index === -1) return prev;

        const updated = [...prev];
        const isCurrentChat = currentChatRef.current?.id === chatId;
        
        updated[index] = {
          ...updated[index],
          updatedAt: new Date().toISOString(),
          unreadCount: isCurrentChat ? 0 : (updated[index].unreadCount || 0) + 1,
        };

        // Mover al inicio
        const [chat] = updated.splice(index, 1);
        return [chat, ...updated];
      });
    }));

    // Nuevo chat
    cleanups.push(subscribe(SOCKET_EVENTS.NEW_CHAT, (chat) => {
      setChats(prev => [chat, ...prev]);
      info(`Nuevo chat de ${chat.customerName || chat.contactNumber}`);
    }));

    // Chat asignado
    cleanups.push(subscribe(SOCKET_EVENTS.ASSIGNED_CHAT, (chat) => {
      setChats(prev => prev.map(c => c.id === chat.id ? chat : c));
      
      if (currentChatRef.current?.id === chat.id) {
        setCurrentChat(chat);
      }
    }));

    // Notificación personal de asignación
    cleanups.push(subscribe(SOCKET_EVENTS.ASSIGNMENT_NOTIFICATION, (chat) => {
      success(`Te han asignado un nuevo chat #${chat.id}`);
      loadChats();
    }));

    // Chat liberado
    cleanups.push(subscribe(SOCKET_EVENTS.RELEASED_CHAT, (chat) => {
      setChats(prev => prev.map(c => c.id === chat.id ? chat : c));
      
      if (currentChatRef.current?.id === chat.id) {
        setCurrentChat(chat);
      }
    }));

    // Chat finalizado
    cleanups.push(subscribe(SOCKET_EVENTS.FINALIZED_CHAT, (chat) => {
      setChats(prev => prev.map(c => c.id === chat.id ? chat : c));
      
      if (currentChatRef.current?.id === chat.id) {
        setCurrentChat(chat);
      }
    }));

    // Mensajes leídos
    cleanups.push(subscribe(SOCKET_EVENTS.MESSAGES_READ, ({ chatId }) => {
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ));
    }));

    // Nueva nota interna
    cleanups.push(subscribe(SOCKET_EVENTS.NEW_INTERNAL_NOTE, ({ chatId, note }) => {
      if (currentChatRef.current?.id === chatId) {
        setCurrentChat(prev => ({
          ...prev,
          notes: [...(prev?.notes || []), note],
        }));
      }
    }));

    // Cleanup
    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, [isConnected, subscribe, info, success, loadChats]);

  // Cargar chats al conectar
  useEffect(() => {
    if (isConnected) {
      loadChats();
    }
  }, [isConnected, loadChats]);

  const value = {
    chats,
    currentChat,
    loading,
    pagination,
    setCurrentChat,
    loadChats,
    loadChat,
    sendMessage,
    sendMedia,
    markAsRead,
    assignChat,
    releaseChat,
    unassignChat,
    createNote,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
}

export default ChatContext;
