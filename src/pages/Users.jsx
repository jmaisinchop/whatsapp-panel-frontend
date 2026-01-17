import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Modal from '../components/Modal';
import { Spinner } from '../components/Loading';
import { Avatar } from '../components/common';
import { 
  Plus, Edit2, Trash2, Search, User, Mail, Shield, Key, 
  RotateCcw, AlertCircle, CheckCircle, XCircle, UserCheck, UserX
} from 'lucide-react';

export default function UsersPage() {
  const { success, error: showError } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'agent'
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers();
      
      let userList = [];
      if (Array.isArray(response)) {
        userList = response;
      } else if (response.data && Array.isArray(response.data)) {
        userList = response.data;
      } else if (response.users && Array.isArray(response.users)) {
        userList = response.users;
      }
      
      setUsers(userList);
    } catch (err) { 
      console.error(err);
      showError('Error al cargar usuarios'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;
        await api.updateUser(editingUser.id, dataToSend);
        success('Usuario actualizado correctamente');
      } else {
        await api.createUser(formData);
        success('Usuario creado correctamente');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      showError(err.message || 'Error al guardar usuario');
    }
  };

  const handleDeactivate = async (user) => {
    if (!confirm(`¿Desactivar al usuario ${user.firstName}? Pasará a la pestaña de Inactivos.`)) return;
    try {
      await api.deleteUser(user.id);
      success('Usuario desactivado');
      loadUsers();
    } catch (err) { 
      console.error(err);
      showError('Error al desactivar usuario'); 
    }
  };

  const handleRestore = async (user) => {
    if (!confirm(`¿Reactivar al usuario ${user.firstName}?`)) return;
    try {
      await api.restoreUser(user.id);
      success('Usuario reactivado');
      loadUsers();
    } catch (err) { 
      console.error(err);
      showError('Error al restaurar usuario'); 
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        firstName: user.firstName || '', 
        lastName: user.lastName || '', 
        email: user.email, 
        role: user.role, 
        password: '' 
      });
    } else {
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'agent' });
    }
    setShowModal(true);
  };

  const renderStatusBadge = (isDeleted) => {
    return isDeleted ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
        <XCircle size={12} /> Inactivo
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle size={12} /> Activo
      </span>
    );
  };

  const renderActions = (user, isDeleted) => {
    return isDeleted ? (
      <button 
        onClick={() => handleRestore(user)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-sm"
        title="Restaurar Usuario"
      >
        <RotateCcw size={14} /> Reactivar
      </button>
    ) : (
      <div className="flex items-center justify-end gap-2">
        <button 
          onClick={() => openModal(user)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => handleDeactivate(user)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Desactivar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  const searchedUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsersList = searchedUsers.filter(u => !u.deletedAt);
  const inactiveUsersList = searchedUsers.filter(u => u.deletedAt);
  const displayUsers = activeTab === 'active' ? activeUsersList : inactiveUsersList;
  const isCreating = !editingUser;

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="5" className="p-12 text-center">
            <Spinner size="lg" />
          </td>
        </tr>
      );
    }

    if (displayUsers.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="p-12 text-center text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle size={32} className="opacity-20" />
              <p>No hay usuarios en esta sección</p>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <>
        {displayUsers.map(user => {
          const isDeleted = !!user.deletedAt;
          return (
            <tr key={user.id} className={`transition-colors group ${isDeleted ? 'bg-slate-50/30' : 'hover:bg-slate-50'}`}>
              <td className="px-6 py-3">
                <div className={`flex items-center gap-3 ${isDeleted ? 'opacity-60 grayscale' : ''}`}>
                  <Avatar name={user.firstName} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-3 text-sm text-slate-600 hidden md:table-cell">
                <span className={isDeleted ? 'opacity-60' : ''}>{user.email}</span>
              </td>
              
              <td className="px-6 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border
                  ${user.role === 'admin' 
                    ? 'bg-violet-50 text-violet-700 border-violet-100' 
                    : 'bg-blue-50 text-blue-700 border-blue-100'}
                  ${isDeleted ? 'opacity-60' : ''}
                `}>
                  {user.role}
                </span>
              </td>

              <td className="px-6 py-3 text-center">
                 {renderStatusBadge(isDeleted)}
              </td>

              <td className="px-6 py-3 text-right">
                {renderActions(user, isDeleted)}
              </td>
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
            <p className="text-slate-500 text-sm mt-1">Control de acceso y roles del personal.</p>
          </div>
          {activeTab === 'active' && (
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm font-medium"
            >
              <Plus size={18} /> Nuevo Usuario
            </button>
          )}
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'active' 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck size={16} /> 
            Usuarios Activos 
            <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] border border-slate-200">
              {activeUsersList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'inactive' 
                ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <UserX size={16} /> 
            Papelera / Inactivos
            <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] border border-slate-200">
              {inactiveUsersList.length}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'active' ? "Buscar usuarios activos..." : "Buscar usuarios inactivos..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={14} /> Nombre
              </label>
              <input
                id="firstName"
                required
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Apellido</label>
              <input
                id="lastName"
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail size={14} /> Email Corporativo
            </label>
            <input
              id="email"
              required
              type="email"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield size={14} /> Rol
              </label>
              <select
                id="role"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="agent">Agente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Key size={14} /> Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder={editingUser ? "Dejar vacío para no cambiar" : "Mínimo 8 caracteres"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required={isCreating}
                minLength={isCreating ? 8 : 0}
              />
            </div>
          </div>

          <Modal.Footer>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}