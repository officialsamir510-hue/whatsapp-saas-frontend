import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Users() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', role: 'agent' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const inviteUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/invite', form);
            const tempPass = response.data.data.tempPassword;
            
            navigator.clipboard.writeText(tempPass);
            toast.success(`User invited! Password copied: ${tempPass}`);
            
            setShowModal(false);
            setForm({ name: '', email: '', role: 'agent' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite');
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Deactivate this user?')) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deactivated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            owner: 'bg-purple-100 text-purple-700',
            admin: 'bg-blue-100 text-blue-700',
            agent: 'bg-green-100 text-green-700',
            user: 'bg-gray-100 text-gray-700'
        };
        return colors[role] || colors.user;
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Team Members</h1>
                    <p className="text-gray-600">Manage your team</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    + Invite User
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td className="px-6 py-4">
                                    <p className="font-medium">{u.name}</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(u.role)}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.role !== 'owner' && u.role !== 'super_admin' && (
                                        <button
                                            onClick={() => deleteUser(u._id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Invite Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
                        <form onSubmit={inviteUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="agent">Agent</option>
                                    <option value="user">User (View Only)</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg">
                                    Send Invite
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}