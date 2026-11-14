import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Shield, UserCheck, UserX, X } from 'lucide-react';
import clsx from 'clsx';
import api from '../../services/api';

const roleColors = {
  Admin: 'text-primary border-primary/20 bg-primary/10',
  Manager: 'text-warning border-warning/20 bg-warning/10',
  'Sales Officer': 'text-secondary border-secondary/20 bg-secondary/10',
};

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: 3
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data?.success) setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleModalChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setModalError('');
  };

  const openAddModal = () => {
    setEditUserId(null);
    setForm({ full_name: '', email: '', password: '', role_id: 3 });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditUserId(user.id);
    setForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role_id: user.role_name === 'Admin' ? 1 : user.role_name === 'Manager' ? 2 : 3
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to deactivate ${user.full_name}?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      return setModalError('Full name and email are required.');
    }

    setModalLoading(true);
    try {
      if (editUserId) {
        await api.put(`/users/${editUserId}`, {
          full_name: form.full_name,
          role_id: Number(form.role_id),
          is_active: true
        });
      } else {

        if (!form.password) return setModalError('Password is required for new users.');
        await api.post('/users', {
          ...form,
          role_id: Number(form.role_id)
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || `Failed to ${editUserId ? 'update' : 'create'} user.`);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">User Management</h1>
          <p className="text-sm text-textMuted mt-1">Manage system users and their access levels</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-primaryHover text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /><span>Add User</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <p className="text-sm text-textMuted">{users.length} total users</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-textMuted bg-surfaceHighlight/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium text-center">Role</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted">No users found.</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-surfaceHighlight/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-textMain">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted">{user.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("px-2.5 py-1 text-xs font-medium rounded border", roleColors[user.role_name] || 'text-textMuted border-border')}>
                      {user.role_name || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      "px-2.5 py-1 text-xs font-medium rounded border",
                      user.is_active ? "text-secondary border-secondary/20 bg-secondary/10" : "text-danger border-danger/20 bg-danger/10"
                    )}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-textMuted">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => toggleStatus(user)}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                        className={clsx("p-1.5 rounded transition-colors",
                          user.is_active
                            ? "text-textMuted hover:text-danger hover:bg-danger/10"
                            : "text-textMuted hover:text-secondary hover:bg-secondary/10"
                        )}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 text-textMuted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border mt-auto flex items-center justify-between text-sm text-textMuted bg-background/50">
          <p>Showing {filtered.length} of {users.length} users</p>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-surfaceHighlight disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surfaceHighlight/30">
              <h2 className="text-lg font-semibold text-textMain">{editUserId ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-textMain transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleModalChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleModalChange}
                  disabled={!!editUserId} // Cannot change email on edit
                  className={clsx(
                    "w-full border border-border rounded-lg px-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors",
                    editUserId ? "bg-surfaceHighlight/50 cursor-not-allowed opacity-70" : "bg-background"
                  )}
                  placeholder="john@example.com"
                  required
                />
              </div>

              {!editUserId && (
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1.5">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleModalChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                    required={!editUserId}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-textMain mb-1.5">Role</label>
                <select
                  name="role_id"
                  value={form.role_id}
                  onChange={handleModalChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="1">Admin</option>
                  <option value="2">Manager</option>
                  <option value="3">Sales Officer</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-border text-textMain rounded-lg hover:bg-surfaceHighlight transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex justify-center items-center"
                >
                  {modalLoading ? <span className="animate-pulse">Saving...</span> : (editUserId ? 'Save Changes' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
