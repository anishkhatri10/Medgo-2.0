import { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getAdminUsers, toggleUserStatus } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await getAdminUsers();
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id) => {
    try {
      await toggleUserStatus(id);
      fetchUsers();
      toast.success('User status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Users</h1>
            <p className="text-gray-400">{users.length} registered users</p>
          </div>
          <div className="w-8 h-8 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-blue-400" />
          </div>
        </div>

        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..." className="input-field pl-11" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-dark-700/50">
                <tr>
                  {['Name', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{u.email}</td>
                    <td className="px-4 py-4 text-gray-400 font-mono">{u.phone}</td>
                    <td className="px-4 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-cancelled'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleToggle(u._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${u.isActive ? 'bg-red-900/30 text-red-400 hover:bg-red-700/40' : 'bg-green-900/30 text-green-400 hover:bg-green-700/40'}`}>
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
