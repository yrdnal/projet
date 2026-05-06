import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  UsersIcon, MagnifyingGlassIcon, ArrowPathIcon,
  ShieldCheckIcon, CheckCircleIcon, XCircleIcon,
  ChevronLeftIcon, ChevronRightIcon, KeyIcon,
} from '@heroicons/react/24/outline';

const ROLES = ['all', 'client', 'vendor', 'admin', 'superadmin'];

const RoleBadge = ({ role }) => {
  const colors = {
    client: 'bg-blue-100 text-blue-700',
    vendor: 'bg-purple-100 text-purple-700',
    admin: 'bg-orange-100 text-orange-700',
    superadmin: 'bg-red-100 text-red-700 font-bold',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
      {role === 'superadmin' && <ShieldCheckIcon className="w-3 h-3 mr-1" />}
      {role}
    </span>
  );
};

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [changingRole, setChangingRole] = useState(null);
  const limit = 15;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      const res = await api.get(`/auth/users?${params}`);
      setUsers(res.data.data?.users || res.data.data || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      setUsers([]);
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await api.patch(`/auth/users/${userId}`, { isActive: !isActive });
      setSuccess(isActive ? 'User deactivated.' : 'User activated.');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update user.'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${newRole}"? This grants significant platform access.`)) return;
    try {
      await api.patch(`/auth/users/${userId}`, { role: newRole });
      setSuccess(`Role updated to "${newRole}" successfully.`);
      setChangingRole(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update role.'); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShieldCheckIcon className="w-7 h-7 text-red-500" /> SuperAdmin — User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Full control over all users, roles and permissions</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" />{success}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="flex flex-1 max-w-sm">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <button type="submit" className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-r-lg hover:bg-red-600">Search</button>
          </form>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400">
            {ROLES.map((r) => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.role === 'superadmin' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                            user.role === 'superadmin' ? 'bg-gradient-to-br from-red-500 to-rose-400' :
                            user.role === 'admin' ? 'bg-gradient-to-br from-orange-400 to-amber-400' :
                            'bg-gradient-to-br from-blue-500 to-blue-400'
                          }`}>
                            {(user.firstName?.[0] || user.first_name?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.firstName || user.first_name} {user.lastName || user.last_name}</p>
                            <p className="text-xs text-gray-400">ID: {user.id?.toString().slice?.(0, 8) || user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {changingRole === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-xs border border-red-300 rounded px-2 py-1 focus:outline-none"
                              onBlur={() => setChangingRole(null)}
                              autoFocus
                            >
                              {['client', 'vendor', 'admin', 'superadmin'].map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RoleBadge role={user.role} />
                            <button onClick={() => setChangingRole(user.id)} className="text-gray-400 hover:text-orange-500 transition-colors" title="Change role">
                              <KeyIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive || user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive || user.is_active ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Active</> : <><XCircleIcon className="w-3.5 h-3.5" /> Inactive</>}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt || user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {user.role !== 'superadmin' && (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.isActive || user.is_active)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${user.isActive || user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {user.isActive || user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50">
                <p className="text-sm text-gray-500">Page {page} of {totalPages} — {total} users</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40">
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminUsers;
