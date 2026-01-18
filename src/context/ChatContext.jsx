import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSocket, SOCKET_EVENTS } from './SocketContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { subscribe, isConnected } = useSocket();
  const { success, info } = useToast();
  
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1, limit: 50, total: 0, totalPages: 0,
  });

  const [messagesPagination, setMessagesPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loadingMessages, setLoadingMessages] = useState(false);

  const currentChatRef = useRef(currentChat);
  
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const handleNewMessage = useCallback((data) => {
    const { chatId, message } = data;
    
    if (currentChatRef.current?.id === chatId) {
      setCurrentChat(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), message],
      }));
    }

    setChats(prev => {
      const index = prev.findIndex(c => c.id === chatId);
      if (index === -1) return prev;

      const updated = [...prev];
      const isCurrentChat = currentChatRef.current?.id === chatId;
      
      updated[index] = {
        ...updated[index],
        updatedAt: new Date().toISOString(),
        unreadCount: isCurrentChat ? 0 : (updated[index].unreadCount || 0) + 1,
        messages: [message],
      };

      const [chat] = updated.splice(index, 1);
      return [chat, ...updated];
    });
  }, []);

  const handleNewChat = useCallback((chat) => {
    setChats(prev => {
      const existingIndex = prev.findIndex(c => c.id === chat.id);
      
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...chat,
        };
        const [updatedChat] = updated.splice(existingIndex, 1);
        return [updatedChat, ...updated];
      }
      
      return [chat, ...prev];
    });
    
    const isNewChat = !chats.some(c => c.id === chat.id);
    
    if (isNewChat) {
      info(`Nuevo chat de ${chat.customerName || chat.contactNumber}`);
    }
  }, [info, chats]);

  const handleChatUpdate = useCallback((chat) => {
    setChats(prev => prev.map(c => c.id === chat.id ? chat : c));
    if (currentChatRef.current?.id === chat.id) {
      setCurrentChat(prevChat => ({
        ...prevChat,
        ...chat,
        messages: prevChat?.messages || [],
      }));
    }
  }, []);

  const loadChatsCallback = useCallback(async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      const response = await api.getChats(page, limit);
      setChats(response.data || []);
      setPagination({
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 50,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAssignmentNotification = useCallback((chat) => {
    success(`Te han asignado un nuevo chat #${chat.id}`);
    loadChatsCallback(1, pagination.limit);
  }, [success, loadChatsCallback, pagination.limit]);

  const handleMessagesRead = useCallback(({ chatId }) => {
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));
  }, []);

  const handleNewInternalNote = useCallback(({ chatId, note }) => {
    if (currentChatRef.current?.id === chatId) {
      setCurrentChat(prev => ({
        ...prev,
        notes: [...(prev?.notes ?? []), note],
      }));
    }
  }, []);

  const handleFinalizedChat = useCallback(({ chatId }) => {
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, status: 'CLOSED', assignedTo: null } : c
    ));
    
    if (currentChatRef.current?.id === chatId) {
      setCurrentChat(prev => ({
        ...prev,
        status: 'CLOSED',
        assignedTo: null,
      }));
    }
  }, []);

  const loadChat = useCallback(async (chatId) => {
    try {
      setLoading(true);
      const chat = await api.getChat(chatId);
      const messagesResponse = await api.getChatMessages(chatId, 1, 50);
      
      const chatWithMessages = {
        ...chat,
        messages: messagesResponse.data || [],
      };
      
      setCurrentChat(chatWithMessages);

      setChats(prev => prev.map(c => 
        c.id === chatId 
          ? { 
              ...c, 
              ...chat,
              messages: messagesResponse.data?.slice(-1) || [] 
            }
          : c
      ));

      setMessagesPagination({
        page: messagesResponse.meta.page,
        limit: messagesResponse.meta.limit,
        total: messagesResponse.meta.total,
        totalPages: messagesResponse.meta.totalPages,
        hasNextPage: messagesResponse.meta.hasNextPage,
        hasPreviousPage: messagesResponse.meta.hasPreviousPage,
      });

      return chat;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!currentChat || loadingMessages || !messagesPagination.hasNextPage) return;

    try {
      setLoadingMessages(true);
      const nextPage = messagesPagination.page + 1;
      const messagesResponse = await api.getChatMessages(currentChat.id, nextPage, 50);
      
      setCurrentChat(prev => ({
        ...prev,
        messages: [...messagesResponse.data, ...(prev?.messages || [])],
      }));

      setMessagesPagination({
        page: messagesResponse.meta.page,
        limit: messagesResponse.meta.limit,
        total: messagesResponse.meta.total,
        totalPages: messagesResponse.meta.totalPages,
        hasNextPage: messagesResponse.meta.hasNextPage,
        hasPreviousPage: messagesResponse.meta.hasPreviousPage,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentChat, loadingMessages, messagesPagination]);

  const sendMessage = useCallback(async (chatId, content) => {
    try {
      return await api.sendMessage(chatId, content);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const sendMedia = useCallback(async (chatId, file, caption = '') => {
    try {
      return await api.sendMedia(chatId, file, caption);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback(async (chatId) => {
    try {
      await api.markChatAsRead(chatId);
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const assignChat = useCallback(async (chatId, agentId = null) => {
    try {
      const chat = await api.assignChat(chatId, agentId);
      success('Chat asignado correctamente');
      return chat;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [success]);

  const releaseChat = useCallback(async (chatId) => {
    try {
      const chat = await api.releaseChat(chatId);
      success('Chat liberado');
      return chat;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [success]);

  const unassignChat = useCallback(async (chatId) => {
    try {
      const chat = await api.unassignChat(chatId);
      success('Chat desasignado');
      return chat;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [success]);

  const createNote = useCallback(async (chatId, content) => {
    try {
      return await api.createNote(chatId, content);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const cleanups = [
      subscribe(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage),
      subscribe(SOCKET_EVENTS.NEW_CHAT, handleNewChat),
      subscribe(SOCKET_EVENTS.ASSIGNED_CHAT, handleChatUpdate),
      subscribe(SOCKET_EVENTS.ASSIGNMENT_NOTIFICATION, handleAssignmentNotification),
      subscribe(SOCKET_EVENTS.RELEASED_CHAT, handleChatUpdate),
      subscribe(SOCKET_EVENTS.FINALIZED_CHAT, handleFinalizedChat),
      subscribe(SOCKET_EVENTS.MESSAGES_READ, handleMessagesRead),
      subscribe(SOCKET_EVENTS.NEW_INTERNAL_NOTE, handleNewInternalNote),
    ];

    return () => {
      cleanups.forEach(cleanup => cleanup?.());
    };
  }, [
    isConnected, subscribe, 
    handleNewMessage, handleNewChat, handleChatUpdate, 
    handleAssignmentNotification, handleMessagesRead, 
    handleNewInternalNote, handleFinalizedChat
  ]);

  useEffect(() => {
    if (isConnected) {
      loadChatsCallback(1, 50);
    }
  }, [isConnected]);

  const value = useMemo(() => ({
    chats,
    currentChat,
    loading,
    pagination,
    messagesPagination,
    loadingMessages,
    setCurrentChat,
    loadChats: loadChatsCallback,
    loadChat,
    loadMoreMessages,
    sendMessage,
    sendMedia,
    markAsRead,
    assignChat,
    releaseChat,
    unassignChat,
    createNote,
  }), [
    chats, currentChat, loading, pagination, messagesPagination, loadingMessages,
    loadChatsCallback, loadChat, loadMoreMessages, sendMessage, sendMedia, markAsRead,
    assignChat, releaseChat, unassignChat, createNote
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
}

export default ChatContext;