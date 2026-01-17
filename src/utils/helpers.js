// =====================================================
// UTILS - Funciones de utilidad
// =====================================================

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha para mostrar en chats
 */
export function formatChatDate(dateString) {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return 'Ayer';
  }
  
  return format(date, 'dd/MM/yy');
}

/**
 * Formatea una fecha para mostrar en mensajes
 */
export function formatMessageTime(dateString) {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return 'Ayer ' + format(date, 'HH:mm');
  }
  
  return format(date, 'dd/MM HH:mm');
}

/**
 * Formatea fecha relativa (hace X minutos)
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

/**
 * Formatea fecha completa
 */
export function formatFullDate(dateString) {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  
  return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
}

/**
 * Formatea número de teléfono
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Limpiar caracteres no numéricos
  // S7781: Prefer `String#replaceAll()` over `String#replace()`.
  const cleaned = phone.replaceAll(/\D/g, '');
  
  // Formatear según longitud
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  if (cleaned.length === 11 || cleaned.length === 12) {
    return '+' + cleaned.replace(/(\d{2,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  
  return '+' + cleaned;
}

/**
 * Trunca texto a una longitud máxima
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Obtiene iniciales de un nombre
 */
export function getInitials(name, fallback = '?') {
  if (!name) return fallback;
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Genera color basado en string (para avatares)
 */
export function stringToColor(str) {
  if (!str) return '#2563eb';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // S7758: Prefer `String#codePointAt()` over `String#charCodeAt()`.
    hash = str.codePointAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#2563eb', // blue
    '#7c3aed', // violet
    '#db2777', // pink
    '#dc2626', // red
    '#ea580c', // orange
    '#16a34a', // green
    '#0891b2', // cyan
    '#4f46e5', // indigo
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Valida email
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Formatea bytes a tamaño legible
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // S7773: Prefer `Number.parseFloat` over `parseFloat`.
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Obtiene extensión de archivo
 */
export function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Verifica si es imagen por mime type
 */
export function isImage(mimeType) {
  return mimeType?.startsWith('image/');
}

/**
 * Verifica si es video por mime type
 */
export function isVideo(mimeType) {
  return mimeType?.startsWith('video/');
}

/**
 * Verifica si es audio por mime type
 */
export function isAudio(mimeType) {
  return mimeType?.startsWith('audio/');
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copia texto al clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
}

/**
 * Status config para chats
 */
export const CHAT_STATUS = {
  AUTO_RESPONDER: {
    label: 'Bot',
    color: 'info',
    description: 'Manejado por el bot'
  },
  ACTIVE: {
    label: 'Activo',
    color: 'success',
    description: 'Chat asignado a un agente'
  },
  PENDING_ASSIGNMENT: {
    label: 'En cola',
    color: 'warning',
    description: 'Esperando asignación'
  },
  CLOSED: {
    label: 'Cerrado',
    color: 'gray',
    description: 'Chat finalizado'
  }
};

/**
 * Rating config para encuestas
 */
export const SURVEY_RATINGS = {
  EXCELENTE: {
    label: 'Excelente',
    color: 'success',
    value: 3
  },
  REGULAR: {
    label: 'Regular',
    color: 'warning',
    value: 2
  },
  MALA: {
    label: 'Mala',
    color: 'error',
    value: 1
  }
};

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  admin: {
    label: 'Administrador',
    color: 'primary'
  },
  agent: {
    label: 'Agente',
    color: 'gray'
  },
  user: {
    label: 'Usuario',
    color: 'gray'
  }
};