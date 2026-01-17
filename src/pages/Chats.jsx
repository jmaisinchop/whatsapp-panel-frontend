import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Loading';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  Search, Paperclip, Send, MoreVertical,ChevronUp,
  MessageSquare, Check, CheckCheck, FileText, ChevronLeft, StickyNote, X
} from 'lucide-react';

export default function ChatsPage() {
  const {
    chats, currentChat, loading, loadChat, setCurrentChat,
    sendMessage, sendMedia, markAsRead, assignChat, releaseChat, createNote,messagesPagination,loadMoreMessages,loadingMessages,
  } = useChat();

  const { user } = useAuth();
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
  const isAssignedToMe = currentChat?.assignedTo?.id === user?.id;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (currentChat?.messages) scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  useEffect(() => {
    if (showAssignModal) {
      api.getAgentsList()
        .then(setAgents)
        .catch(err => console.error('Error al cargar agentes:', err));
    }
  }, [showAssignModal]);

  const filteredChats = chats.filter(chat =>
    chat.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectChat = async (chat) => {
    try {
      await loadChat(chat.id);
      await markAsRead(chat.id);
    } catch (err) {
      console.error(err);
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
      console.error(err);
      showError(err.message || 'Error al enviar');
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
      console.error(err);
      showError(err.message || 'Error al asignar');
    }
  };

  const handleRelease = async () => {
    if (!confirm('¿Seguro que deseas liberar este chat?')) return;
    try {
      await releaseChat(currentChat.id);
      loadChat(currentChat.id);
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error al liberar');
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
      console.error(err);
      showError('Error al crear nota');
    }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status) => {
    const colors = {
      'AUTO_RESPONDER': 'bg-violet-100 text-violet-700',
      'ACTIVE': 'bg-emerald-100 text-emerald-700',
      'PENDING_ASSIGNMENT': 'bg-amber-100 text-amber-700',
      'CLOSED': 'bg-slate-100 text-slate-600',
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  const getStatusLabel = (status) => {
    if (status === 'AUTO_RESPONDER') return 'Bot';
    if (status === 'ACTIVE') return 'Activo';
    return 'Cola';
  };

  const getChatButtonClass = (chat) => {
    const isActive = currentChat?.id === chat.id;
    const baseClass = "w-full text-left flex items-center gap-3 p-3.5 cursor-pointer border-b border-slate-50 transition-all hover:bg-slate-50 focus:outline-none focus:bg-slate-100";
    const activeClass = "bg-blue-50/80 border-l-4 border-l-blue-600 pl-[11px]";
    const inactiveClass = "border-l-4 border-l-transparent pl-[14px]";

    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  const renderChatList = () => {
    if (loading && !chats.length) {
      return <div className="p-8 flex justify-center"><Spinner size="md" /></div>;
    }

    if (filteredChats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
          <MessageSquare size={32} className="opacity-30" />
          <p className="text-sm">Sin resultados</p>
        </div>
      );
    }

    return filteredChats.map(chat => (
      <button
        type="button"
        key={chat.id}
        onClick={() => handleSelectChat(chat)}
        className={getChatButtonClass(chat)}
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {chat.customerName?.[0] || chat.contactNumber?.[0] || '?'}
          </div>
          {chat.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {chat.unreadCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={`font-semibold truncate text-sm ${currentChat?.id === chat.id ? 'text-blue-900' : 'text-slate-800'}`}>
              {chat.customerName || chat.contactNumber}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {formatTime(chat.updatedAt)}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <p className={`text-xs truncate flex-1 ${chat.unreadCount > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
              {chat.messages?.[chat.messages.length - 1]?.content || '📎 Archivo adjunto'}
            </p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide font-bold ${getStatusColor(chat.status)}`}>
              {getStatusLabel(chat.status)}
            </span>
          </div>
        </div>
      </button>
    ));
  };

  const getMessageClasses = (isCustomer, isBot) => {
    const baseClasses = "max-w-[85%] sm:max-w-[70%] rounded-xl px-3 py-2 shadow-sm relative text-[13.5px] leading-snug";

    if (isCustomer) {
      return `${baseClasses} bg-white text-slate-800 rounded-tl-none border border-slate-100`;
    }
    if (isBot) {
      return `${baseClasses} bg-emerald-50 text-slate-800 border border-emerald-100`;
    }
    return `${baseClasses} bg-[#005c4b] text-white rounded-tr-none border border-emerald-900/10`;
  };

  return (
    <div className="flex h-full bg-white relative overflow-hidden rounded-xl shadow-sm border border-slate-200">

      <aside className={`
        w-full md:w-[360px] bg-white border-r border-slate-200 flex flex-col z-20 absolute md:static inset-0 transition-transform duration-300
        ${currentChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Mensajes</h2>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            {chats.length}
          </span>
        </div>

        <div className="p-3 border-b border-slate-100">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderChatList()}
        </div>
      </aside>

      <main className={`
        flex-1 flex flex-col bg-[#efeae2] relative z-10 transition-transform duration-300 w-full md:w-auto absolute md:static inset-0
        ${currentChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="absolute inset-0 opacity-[0.4]"
          style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}></div>

        {currentChat ? (
          <>
            <header className="h-16 px-4 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between shadow-sm z-20 relative">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentChat(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                  <ChevronLeft size={22} />
                </button>
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {currentChat.customerName?.[0] || '?'}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm leading-tight">
                    {currentChat.customerName || currentChat.contactNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    +{currentChat.contactNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!currentChat.assignedTo && (
                  <button onClick={() => handleAssign()} className="hidden sm:flex px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors">
                    Tomar Chat
                  </button>
                )}
                {isAssignedToMe && (
                  <button onClick={handleRelease} className="hidden sm:flex px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors">
                    Liberar
                  </button>
                )}
                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                <button onClick={() => setShowNoteModal(true)} className="p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-500 rounded-lg transition-all" title="Notas">
                  <StickyNote size={18} />
                </button>
                <button onClick={() => setShowDetails(!showDetails)} className={`p-2 rounded-lg transition-colors ${showDetails ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10 relative custom-scrollbar">
              {messagesPagination.hasPreviousPage && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => loadMoreMessages(currentChat.id, messagesPagination.page + 1)}
                    disabled={loadingMessages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingMessages ? (
                      <>
                        <Spinner size="sm" />
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp size={16} />
                        <span>Cargar mensajes anteriores ({messagesPagination.total - currentChat.messages?.length || 0} más)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              {currentChat.messages?.map((msg, index) => {
                const isCustomer = msg.sender === 'CUSTOMER';
                const isSystem = msg.sender === 'SYSTEM';
                const isBot = msg.sender === 'BOT';

                if (isSystem) {
                  return (
                    <div key={msg.id || index} className="flex justify-center my-4">
                      <span className="bg-slate-200/90 text-slate-600 text-[10px] px-3 py-1 rounded-full shadow-sm font-medium tracking-wide uppercase">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id || index} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'} group`}>
                    <div className={getMessageClasses(isCustomer, isBot)}>
                      {!isCustomer && (
                        <span className={`text-[10px] font-bold block mb-1 uppercase tracking-wider ${isBot ? 'text-emerald-600' : 'text-blue-100'}`}>
                          {isBot ? '🤖 Kika' : msg.senderName || 'Agente'}
                        </span>
                      )}

                      {msg.mediaUrl && (
                        <div className="mb-2 mt-1 -mx-1">
                          {msg.mimeType?.startsWith('image/') ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${msg.mediaUrl}`}
                              alt="Media"
                              className="rounded-lg max-h-64 object-cover cursor-pointer hover:brightness-95 transition-all shadow-sm"
                            />
                          ) : (
                            <a
                              href={`${import.meta.env.VITE_API_URL}${msg.mediaUrl}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
                            >
                              <div className="bg-white p-2 rounded-md shadow-sm">
                                <FileText size={20} className="text-blue-500" />
                              </div>
                              <span className="font-medium underline decoration-slate-400">Ver archivo adjunto</span>
                            </a>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      <div className="flex items-center justify-end gap-1 mt-1 opacity-60 select-none">
                        <span className="text-[9px]">{formatTime(msg.timestamp)}</span>
                        {!isCustomer && (
                          msg.readAt ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 z-20 relative">
              {selectedFile && (
                <div className="absolute bottom-full left-0 right-0 bg-slate-50/95 backdrop-blur border-t border-slate-200 p-3 px-4 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Paperclip size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Archivo seleccionado</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{selectedFile.name}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-500 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAssignedToMe || sending}
                  className="mb-1 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors disabled:opacity-50"
                >
                  <Paperclip size={22} />
                </button>

                <div className="flex-1 bg-white border border-slate-300 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                  <input
                    type="text"
                    placeholder={isAssignedToMe ? "Escribe un mensaje..." : "Debes tomar este chat para responder"}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={!isAssignedToMe || sending}
                    className="w-full bg-transparent border-none focus:ring-0 p-1 text-sm placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isAssignedToMe || sending || (!messageText.trim() && !selectedFile)}
                  className="mb-1 p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center justify-center"
                >
                  {sending ? <Spinner size="sm" className="border-white" /> : <Send size={20} className="ml-0.5" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 z-20 border-l border-slate-200">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <MessageSquare size={40} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Selecciona un chat</h3>
            <p className="text-slate-500 text-sm max-w-xs text-center">Gestiona tus conversaciones de WhatsApp desde aquí de forma centralizada.</p>
          </div>
        )}
      </main>

      {currentChat && showDetails && (
        <aside className="w-80 bg-white border-l border-slate-200 z-30 absolute right-0 inset-y-0 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <button onClick={() => setShowDetails(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h3 className="font-semibold text-slate-700 text-sm">Información del contacto</h3>
          </div>

          <div className="p-6 text-center border-b border-slate-50">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner text-slate-400">
              {currentChat.customerName?.[0] || '?'}
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-0.5">{currentChat.customerName}</h2>
            <p className="text-slate-500 font-mono text-xs">+{currentChat.contactNumber}</p>
          </div>

          <div className="p-5 space-y-5">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado Actual</h4>
              <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold w-full text-center ${getStatusColor(currentChat.status)}`}>
                {currentChat.status}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agente Asignado</h4>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {currentChat.assignedTo?.firstName?.[0] || '?'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">
                    {currentChat.assignedTo ? `${currentChat.assignedTo.firstName} ${currentChat.assignedTo.lastName}` : 'Sin asignar'}
                  </span>
                  <span className="text-[10px] text-slate-400">{currentChat.assignedTo?.email || 'Pendiente'}</span>
                </div>
              </div>
            </div>

            {currentChat.notes?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <StickyNote size={12} /> Notas Internas
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {currentChat.notes.map((note, i) => (
                    <div key={note.id || i} className="bg-amber-50 border border-amber-100/50 p-3 rounded-xl relative group">
                      <p className="text-xs text-slate-700 mb-1.5 leading-relaxed">{note.content}</p>
                      <div className="flex justify-between items-center border-t border-amber-100/50 pt-1.5">
                        <span className="text-[10px] text-amber-600 font-medium truncate max-w-[100px]">
                          {note.author?.firstName || 'Agente'}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Agregar Nota Interna" size="sm">
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg flex gap-2 items-start text-xs text-amber-700 mb-2">
            <StickyNote size={14} className="mt-0.5 flex-shrink-0" />
            <p>Estas notas solo son visibles para otros agentes, el cliente no las verá.</p>
          </div>
          <textarea
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm min-h-[120px] placeholder:text-slate-400 resize-none"
            placeholder="Escribe detalles importantes sobre este cliente..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            autoFocus
          />
          <Modal.Footer>
            <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleCreateNote} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Guardar Nota</button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Asignar Chat" size="sm">
        <div className="mb-3 px-1">
          <input type="text" placeholder="Filtrar agentes..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar -mx-2 px-2">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleAssign(agent.id)}
              className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group border border-transparent hover:border-slate-100"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center text-xs font-bold transition-colors">
                {agent.firstName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-800 block truncate group-hover:text-blue-700">{agent.firstName} {agent.lastName}</span>
                <span className="text-xs text-slate-500 truncate">{agent.email}</span>
              </div>
              {connectedAgents.some(a => a.id === agent.id) && (
                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-600">Online</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal>

    </div>
  );
}