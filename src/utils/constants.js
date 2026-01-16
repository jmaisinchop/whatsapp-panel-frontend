// =====================================================
// CONSTANTS - Constantes de la aplicación
// =====================================================

// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const CHAT_PAGE_SIZE = 50;

// File Upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'];
export const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

// Chat Status
export const CHAT_STATUS = {
  AUTO_RESPONDER: 'AUTO_RESPONDER',
  ACTIVE: 'ACTIVE',
  PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT',
  CLOSED: 'CLOSED',
};

// Message Sender Types
export const MESSAGE_SENDER = {
  CUSTOMER: 'CUSTOMER',
  AGENT: 'AGENT',
  SYSTEM: 'SYSTEM',
  BOT: 'BOT',
};

// Survey Ratings
export const SURVEY_RATING = {
  EXCELENTE: 'EXCELENTE',
  REGULAR: 'REGULAR',
  MALA: 'MALA',
};

// User Roles
export const USER_ROLE = {
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user',
};

// WhatsApp Connection Status
export const WHATSAPP_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  AWAITING_QR: 'awaiting_qr',
};

// Socket Events (Server -> Client)
export const SOCKET_EVENTS = {
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
  
  // Presence events
  PRESENCE_UPDATE: 'presenceUpdate',
  ASSIGNMENT_NOTIFICATION: 'assignment-notification',
  
  // Dashboard events
  SURVEY_UPDATE: 'dashboard:surveyUpdate',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CHATS: '/chats',
  USERS: '/users',
  SETTINGS: '/settings',
};

// Time constants (ms)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

// Debounce delays
export const DEBOUNCE = {
  SEARCH: 500,
  INPUT: 300,
  RESIZE: 100,
};

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
};

// Toast durations (ms)
export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 4000,
  LONG: 6000,
};

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  CHAT_STATUS,
  MESSAGE_SENDER,
  SURVEY_RATING,
  USER_ROLE,
  WHATSAPP_STATUS,
  SOCKET_EVENTS,
  STORAGE_KEYS,
  ROUTES,
};
