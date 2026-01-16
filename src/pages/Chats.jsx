// =====================================================
// CHATS PAGE - Lista de chats y mensajería
// =====================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Loading';
import Modal from '../components/Modal';
import api from '../services/api';
import './Chats.css';

export default function ChatsPage() {
  const {
    chats,
    currentChat,
    loading,
    loadChat,
    setCurrentChat,
    sendMessage,
    sendMedia,
    markAsRead,
    assignChat,
    releaseChat,
    createNote,
  } = useChat();
  const { user, isAdmin } = useAuth();
  const { connectedAgents } = useSocket();
  const { success, error: showError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (currentChat?.messages) {
      scrollToBottom();
    }
  }, [currentChat?.messages, scrollToBottom]);

  useEffect(() => {
    if (showAssignModal) {
      api.getAgentsList().then(setAgents).catch(console.error);
    }
  }, [showAssignModal]);

  const filteredChats = chats.filter(chat => {
    const search = searchTerm.toLowerCase();
    return (
      chat.contactNumber?.toLowerCase().includes(search) ||
      chat.customerName?.toLowerCase().includes(search)
    );
  });

  const handleSelectChat = async (chat) => {
    try {
      await loadChat(chat.id);
      await markAsRead(chat.id);
    } catch (err) {
      showError('Error al cargar el chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() && !selectedFile) return;
    if (!currentChat) return;

    setSending(true);

    try {
      if (selectedFile) {
        await sendMedia(currentChat.id, selectedFile, '');
        setSelectedFile(null);
      } else {
        await sendMessage(currentChat.id, messageText.trim());
      }
      setMessageText('');
    } catch (err) {
      showError(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (agentId = null) => {
    try {
      await assignChat(currentChat.id, agentId);
      setShowAssignModal(false);
      loadChat(currentChat.id);
    } catch (err) {
      showError(err.message || 'Error al asignar chat');
    }
  };

  const handleRelease = async () => {
    if (!confirm('¿Seguro que deseas liberar este chat?')) return;
    
    try {
      await releaseChat(currentChat.id);
      loadChat(currentChat.id);
    } catch (err) {
      showError(err.message || 'Error al liberar chat');
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await createNote(currentChat.id, noteContent.trim());
      setNoteContent('');
      setShowNoteModal(false);
      success('Nota creada');
      loadChat(currentChat.id);
    } catch (err) {
      showError('Error al crear nota');
    }
  };

  const formatMessageDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatChatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'AUTO_RESPONDER': { label: 'Bot', class: 'badge-info' },
      'ACTIVE': { label: 'Activo', class: 'badge-success' },
      'PENDING_ASSIGNMENT': { label: 'En cola', class: 'badge-warning' },
      'CLOSED': { label: 'Cerrado', class: 'badge-gray' },
    };
    return badges[status] || { label: status, class: 'badge-gray' };
  };

const isAssignedToMe = currentChat?.assignedTo?.id === user?.id;
  return (
    <div className="chats-page">
      {/* Chat List */}
      <aside className={`chat-list ${currentChat ? 'chat-list-hidden' : ''}`}>
        <div className="chat-list-header">
          <h2>Conversaciones</h2>
          <span className="chat-count">{chats.length}</span>
        </div>

        <div className="chat-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="chat-list-items">
          {loading ? (
            <div className="chat-list-loading">
              <Spinner />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="chat-list-empty">
              <span className="empty-icon">💬</span>
              <p>No hay conversaciones</p>
            </div>
          ) : (
            filteredChats.map(chat => {
              const statusInfo = getStatusBadge(chat.status);
              
              return (
                <div
                  key={chat.id}
                  className={`chat-item ${currentChat?.id === chat.id ? 'chat-item-active' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="chat-item-avatar">
                    {chat.customerName?.[0] || chat.contactNumber?.[0] || '?'}
                  </div>
                  
                  <div className="chat-item-content">
                    <div className="chat-item-header">
                      <span className="chat-item-name">
                        {chat.customerName || chat.contactNumber}
                      </span>
                      <span className="chat-item-time">
                        {formatChatDate(chat.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="chat-item-footer">
                      <span className={`chat-item-status badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                      
                      {chat.unreadCount > 0 && (
                        <span className="chat-item-unread">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat View */}
      <main className={`chat-view ${currentChat ? 'chat-view-active' : ''}`}>
        {!currentChat ? (
          <div className="chat-empty">
            <span className="empty-icon-large">💬</span>
            <h3>Selecciona una conversación</h3>
            <p>Elige un chat de la lista para comenzar</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="chat-header">
              <button 
                className="chat-back"
                onClick={() => setCurrentChat(null)}
              >
                ←
              </button>

              <div className="chat-header-info">
                <div className="chat-header-avatar">
                  {currentChat.customerName?.[0] || currentChat.contactNumber?.[0] || '?'}
                </div>
                <div className="chat-header-details">
                  <h3>{currentChat.customerName || currentChat.contactNumber}</h3>
                  <span className="chat-header-number">
                    +{currentChat.contactNumber}
                  </span>
                </div>
              </div>

              <div className="chat-header-actions">
                {!currentChat.assignedTo && (
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => handleAssign()}
                  >
                    Tomar
                  </button>
                )}

                {isAssignedToMe && (
                  <button 
                    className="btn-outline btn-sm"
                    onClick={handleRelease}
                  >
                    Liberar
                  </button>
                )}

                {isAdmin() && currentChat.assignedTo && (
                  <button 
                    className="btn-ghost btn-sm"
                    onClick={() => setShowAssignModal(true)}
                  >
                    Asignar
                  </button>
                )}

                <button 
                  className="btn-ghost btn-sm"
                  onClick={() => setShowNoteModal(true)}
                  title="Agregar nota"
                >
                  📝
                </button>

                <button 
                  className="btn-ghost btn-sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  ⋮
                </button>
              </div>
            </header>

            {/* Chat Content */}
            <div className="chat-content">
              <div className="chat-messages">
                {currentChat.messages?.map((msg, index) => {
                  const isCustomer = msg.sender === 'CUSTOMER';
                  const isSystem = msg.sender === 'SYSTEM';
                  const isBot = msg.sender === 'BOT';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id || index} className="message-system">
                        ℹ️ {msg.content}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id || index}
                      className={`message ${isCustomer ? 'message-customer' : 'message-agent'} ${isBot ? 'message-bot' : ''}`}
                    >
                      {msg.mediaUrl && (
                        <div className="message-media">
                          {msg.mimeType?.startsWith('image/') ? (
                            <img 
                              src={`http://localhost:3000${msg.mediaUrl}`} 
                              alt="Media"
                            />
                          ) : (
                            <a 
                              href={`http://localhost:3000${msg.mediaUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="message-file"
                            >
                              📎 Ver archivo
                            </a>
                          )}
                        </div>
                      )}
                      
                      <div className="message-content">
                        {!isCustomer && (
                          <span className="message-sender">
                            {isBot ? '🤖 Kika' : msg.senderName || 'Agente'}
                          </span>
                        )}
                        <p>{msg.content}</p>
                        <span className="message-time">
                          {formatMessageDate(msg.timestamp)}
                          {!isCustomer && msg.readAt && ' ✓✓'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {showDetails && (
                <aside className="chat-details">
                  <div className="details-header">
                    <h4>Detalles</h4>
                    <button onClick={() => setShowDetails(false)}>×</button>
                  </div>

                  <div className="details-section">
                    <label>Estado</label>
                    <span className={`badge ${getStatusBadge(currentChat.status).class}`}>
                      {getStatusBadge(currentChat.status).label}
                    </span>
                  </div>

                  <div className="details-section">
                    <label>Asignado a</label>
                    <span>
                      {currentChat.assignedTo 
                        ? `${currentChat.assignedTo.firstName || currentChat.assignedTo.email}`
                        : 'Sin asignar'}
                    </span>
                  </div>

                  <div className="details-section">
                    <label>Creado</label>
                    <span>{new Date(currentChat.createdAt).toLocaleString('es')}</span>
                  </div>

                  {currentChat.notes?.length > 0 && (
                    <div className="details-section">
                      <label>Notas internas</label>
                      <div className="details-notes">
                        {currentChat.notes.map((note, i) => (
                          <div key={i} className="note-item">
                            <p>{note.content}</p>
                            <span>
                              {note.author?.firstName || 'Anónimo'} - {new Date(note.createdAt).toLocaleDateString('es')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              )}
            </div>

            {/* Message Input */}
            <form className="chat-input" onSubmit={handleSendMessage}>
              {selectedFile && (
                <div className="file-preview">
                  <div className="file-preview-info">
                    📎 {selectedFile.name}
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)}>×</button>
                </div>
              )}

              <div className="chat-input-row">
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                
                <button
                  type="button"
                  className="btn-ghost btn-icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAssignedToMe || sending}
                >
                  📎
                </button>

                <input
                  type="text"
                  placeholder={isAssignedToMe ? "Escribe un mensaje..." : "No tienes este chat asignado"}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={!isAssignedToMe || sending}
                />

                <button
                  type="submit"
                  className="btn-primary btn-icon"
                  disabled={!isAssignedToMe || sending || (!messageText.trim() && !selectedFile)}
                >
                  {sending ? <Spinner size="sm" /> : '➤'}
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* Modal: Agregar Nota */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Agregar Nota Interna"
        size="sm"
      >
        <textarea
          placeholder="Escribe una nota..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          rows={4}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <Modal.Footer>
          <button className="btn-secondary" onClick={() => setShowNoteModal(false)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleCreateNote}>
            Guardar
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Asignar a Agente */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Asignar Chat"
        size="sm"
      >
        <div className="assign-list">
          {agents.map(agent => (
            <div 
              key={agent.id}
              className="assign-item"
              onClick={() => handleAssign(agent.id)}
            >
              <div className="assign-avatar">
                {agent.firstName?.[0] || 'A'}
              </div>
              <span>{agent.firstName} {agent.lastName}</span>
              {connectedAgents.some(a => a.id === agent.id) && (
                <span className="assign-online">Online</span>
              )}
            </div>
          ))}
        </div>
        <Modal.Footer>
          <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>
            Cancelar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
