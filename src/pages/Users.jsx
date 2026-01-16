// =====================================================
// USERS PAGE - Gestión de usuarios (Solo Admin)
// =====================================================

import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Spinner } from '../components/Loading';
import Modal from '../components/Modal';
import './Users.css';

export default function UsersPage() {
  const { success, error: showError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'agent',
  });

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.getUsers(page, pagination.limit, searchTerm);
      setUsers(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      showError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'agent',
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      showError('El email es requerido');
      return;
    }

    if (modalMode === 'create' && !formData.password) {
      showError('La contraseña es requerida');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        await api.createUser(formData);
        success('Usuario creado correctamente');
      } else {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.updateUser(selectedUser.id, updateData);
        success('Usuario actualizado correctamente');
      }
      
      setShowModal(false);
      loadUsers(pagination.page);
    } catch (err) {
      showError(err.message || 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (user) => {
    if (!confirm(`¿Seguro que deseas desactivar a ${user.firstName || user.email}?`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      success('Usuario desactivado');
      loadUsers(pagination.page);
    } catch (err) {
      showError(err.message || 'Error al desactivar usuario');
    }
  };

  const handleReactivate = async (user) => {
    try {
      await api.restoreUser(user.id);
      success('Usuario reactivado');
      loadUsers(pagination.page);
    } catch (err) {
      showError(err.message || 'Error al reactivar usuario');
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Usuarios</h1>
          <p>Gestiona los usuarios del sistema</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="users-filters card">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table card">
        {loading ? (
          <div className="table-loading">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="table-empty">
            <span style={{ fontSize: '3rem' }}>👤</span>
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={user.deletedAt ? 'row-inactive' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.firstName?.[0] || user.email?.[0] || 'U'}
                          </div>
                          <span>
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || 'Sin nombre'}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
                          {user.role === 'admin' ? '🛡️ ' : ''}{user.role}
                        </span>
                      </td>
                      <td>
                        {user.deletedAt ? (
                          <span className="badge badge-error">Inactivo</span>
                        ) : (
                          <span className="badge badge-success">Activo</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          {!user.deletedAt ? (
                            <>
                              <button 
                                className="btn-ghost btn-icon"
                                title="Editar"
                                onClick={() => openEditModal(user)}
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-ghost btn-icon"
                                title="Desactivar"
                                onClick={() => handleDeactivate(user)}
                              >
                                🗑️
                              </button>
                            </>
                          ) : (
                            <button 
                              className="btn-ghost btn-icon"
                              title="Reactivar"
                              onClick={() => handleReactivate(user)}
                            >
                              ↩️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="table-pagination">
                <span>
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                </span>
                <div className="pagination-buttons">
                  <button
                    className="btn-ghost btn-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => loadUsers(pagination.page - 1)}
                  >
                    ←
                  </button>
                  <span className="page-number">{pagination.page}</span>
                  <button
                    className="btn-ghost btn-sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => loadUsers(pagination.page + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Nombre"
              />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para no cambiar)'}
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                minLength={modalMode === 'create' ? 8 : 0}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="agent">Agente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <Modal.Footer>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : (modalMode === 'create' ? 'Crear' : 'Guardar')}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
