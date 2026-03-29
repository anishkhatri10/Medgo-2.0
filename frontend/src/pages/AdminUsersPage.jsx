import { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Phone, Mail } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getAdminUsers, toggleUserStatus } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await getAdminUsers();
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id, name, isActive) => {
    try {
      await toggleUserStatus(id);
      toast.success(`${name} ${isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchFilter = filter === 'all' ? true : filter === 'active' ? u.isActive : !u.isActive;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
            <p className="text-gray-400">{users.length} registered users</p>
          </div>
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..." className="input-field pl-11" />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                ${filter === f ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
              {f === 'all' ? 'All Users' : f === 'active' ? '🟢 Active' : '🔴 Inactive'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-dark-700/50">
                <tr>
                  {['User', 'Contact', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 flex items-center gap-1.5"><Mail size={11} />{u.email}</span>
                        <span className="text-gray-500 flex items-center gap-1.5 font-mono text-xs"><Phone size={11} />{u.phone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                        {u.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(u._id, u.name, u.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                          ${u.isActive
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white'
                            : 'bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white'}`}>
                        {u.isActive ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">No users found</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
