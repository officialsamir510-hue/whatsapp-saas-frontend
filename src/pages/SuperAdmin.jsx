import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SuperAdmin() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.isSuperAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [statsRes, tenantsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/tenants'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data.data);
            setTenants(tenantsRes.data.data);
            setUsers(usersRes.data.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const updateTenant = async (tenantId, updates) => {
        try {
            await api.put(`/admin/tenants/${tenantId}`, updates);
            toast.success('Tenant updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-red-600">🔥 Super Admin Panel</h1>
                <p className="text-gray-600">Complete system control</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-500 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-80">Total Companies</p>
                    <p className="text-3xl font-bold">{stats?.tenants?.total || 0}</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-80">Total Users</p>
                    <p className="text-3xl font-bold">{stats?.users?.total || 0}</p>
                </div>
                <div className="bg-purple-500 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-80">Active Companies</p>
                    <p className="text-3xl font-bold">{stats?.tenants?.active || 0}</p>
                </div>
                <div className="bg-orange-500 text-white p-6 rounded-lg">
                    <p className="text-sm opacity-80">Active Users</p>
                    <p className="text-3xl font-bold">{stats?.users?.active || 0}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b">
                <nav className="flex space-x-8">
                    {['overview', 'tenants', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 border-b-2 font-medium capitalize ${
                                activeTab === tab
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tenants */}
            {activeTab === 'tenants' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {tenants.map((t) => (
                                <tr key={t._id}>
                                    <td className="px-6 py-4 font-medium">{t.company || t.name}</td>
                                    <td className="px-6 py-4 capitalize">{t.plan}</td>
                                    <td className="px-6 py-4">{t.messageCredits}</td>
                                    <td className="px-6 py-4">{t.stats?.users || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {t.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => updateTenant(t._id, { isActive: !t.isActive })}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {t.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </td>
                                    <td className="px-6 py-4">{u.tenantId?.company || 'N/A'}</td>
                                    <td className="px-6 py-4 capitalize">{u.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-semibold mb-4">Recent Companies</h3>
                        {tenants.slice(0, 5).map((t) => (
                            <div key={t._id} className="flex justify-between py-2 border-b">
                                <span>{t.company || t.name}</span>
                                <span className="text-sm text-gray-500">{t.plan}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-semibold mb-4">Recent Users</h3>
                        {users.slice(0, 5).map((u) => (
                            <div key={u._id} className="flex justify-between py-2 border-b">
                                <span>{u.name}</span>
                                <span className="text-sm text-gray-500">{u.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}