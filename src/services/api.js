// =====================================================
// API SERVICE - Comunicación con el Backend
// Maneja todos los 32 endpoints del sistema
// =====================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Headers por defecto
  getHeaders(isFormData = false) {
    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método base para peticiones
  async request(endpoint, options = {}) {
    const { isFormData = false, ...fetchOptions } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(isFormData);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
      });

      // Token expirado o inválido
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Métodos HTTP básicos
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload de archivos
  async upload(endpoint, formData) {
    const token = this.getToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al subir archivo');
    }

    return data;
  }

  // =====================================================
  // AUTH ENDPOINTS (2)
  // =====================================================

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Credenciales inválidas');
    }

    return data;
  }

  getProfile() {
    return this.get('/auth/profile');
  }

  // =====================================================
  // USERS ENDPOINTS (7)
  // =====================================================

  getUsers(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    return this.get(`/users?${params}`);
  }

  createUser(userData) {
    return this.post('/users/register', userData);
  }

  updateUser(id, userData) {
    return this.patch(`/users/${id}`, userData);
  }

  deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  restoreUser(id) {
    return this.post(`/users/${id}/restore`, {});
  }

  getDeactivatedUsers() {
    return this.get('/users/deactivated');
  }

  getAgentsList() {
    return this.get('/users/list/agents');
  }

  // =====================================================
  // CHATS ENDPOINTS (10)
  // =====================================================

  getChats(page = 1, limit = 50) {
    return this.get(`/chats?page=${page}&limit=${limit}`);
  }

  getChat(chatId) {
    return this.get(`/chats/${chatId}`);
  }

  markChatAsRead(chatId) {
    return this.patch(`/chats/${chatId}/read`, {});
  }

  sendMessage(chatId, content) {
    return this.post(`/chats/${chatId}/message`, { content });
  }

  sendMedia(chatId, file, caption = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    return this.upload(`/chats/${chatId}/media`, formData);
  }

  releaseChat(chatId) {
    return this.patch(`/chats/${chatId}/release`, {});
  }

  assignChat(chatId, agentId = null) {
    const body = agentId ? { agentId } : {};
    return this.patch(`/chats/${chatId}/assign`, body);
  }

  unassignChat(chatId) {
    return this.patch(`/chats/${chatId}/unassign`, {});
  }

  createNote(chatId, content) {
    return this.post(`/chats/${chatId}/notes`, { content });
  }

  // =====================================================
  // CONTACTS ENDPOINTS (1)
  // =====================================================

  getContactInfo(contactId) {
    return this.get(`/contacts/${contactId}`);
  }

  // =====================================================
  // ADMIN ENDPOINTS (7)
  // =====================================================

  getBotProfile() {
    return this.get('/admin/bot-profile');
  }

  uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.upload('/admin/profile-picture', formData);
  }

  updateBotStatus(status) {
    return this.patch('/admin/bot-status', { status });
  }

  getConnectedAgents() {
    return this.get('/admin/connected-agents');
  }

  getWhatsAppHealth() {
    return this.get('/admin/whatsapp/health');
  }

  getWhatsAppStatus() {
    return this.get('/admin/whatsapp/status');
  }

  logoutWhatsApp() {
    return this.post('/admin/whatsapp/logout', {});
  }

  // =====================================================
  // DASHBOARD ENDPOINTS (6)
  // =====================================================

  getSurveyAnalytics() {
    return this.get('/dashboard/survey-analytics');
  }

  getRealtimeStats() {
    return this.get('/dashboard/realtime-stats');
  }

  getSurveyTrend(days = 7) {
    return this.get(`/dashboard/survey-trend?days=${days}`);
  }

  getCommentsByRating(rating, limit = 10) {
    return this.get(`/dashboard/comments/${rating}?limit=${limit}`);
  }

  invalidateCache() {
    return this.post('/dashboard/cache/invalidate', {});
  }

  clearCache() {
    return this.post('/dashboard/cache/clear', {});
  }
}

// Exportar instancia única
export const api = new ApiService();
export default api;
