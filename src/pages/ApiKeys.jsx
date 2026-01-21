import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaKey, FaTrash, FaCopy, FaPlus, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function ApiKeys() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newApiKey, setNewApiKey] = useState(null);
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    // Fetch API keys
    const { data: apiKeys, isLoading } = useQuery({
        queryKey: ['api-keys'],
        queryFn: async () => {
            const { data } = await api.get('/keys');
            return data.data;
        }
    });

    // Create API key mutation
    const createMutation = useMutation({
        mutationFn: (formData) => api.post('/keys', formData),
        onSuccess: (response) => {
            setNewApiKey(response.data.data.key);
            queryClient.invalidateQueries(['api-keys']);
            toast.success('API key created successfully!');
            setShowCreateModal(false);
        },
        onError: (error) => {
            if (error.response?.data?.upgrade) {
                toast.error('Please upgrade your plan to create more API keys');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create API key');
            }
        }
    });

    // Delete API key mutation
    const deleteMutation = useMutation({
        mutationFn: (keyId) => api.delete(`/keys/${keyId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['api-keys']);
            toast.success('API key deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete API key');
        }
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    const canCreateMore = (apiKeys?.length || 0) < (user?.planLimits?.apiKeysLimit || 2);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your API keys for integration
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {apiKeys?.length || 0} / {user?.planLimits?.apiKeysLimit || 2} keys used
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        disabled={!canCreateMore}
                        className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus /> Create API Key
                    </button>
                </div>
            </div>

            {/* New API Key Alert */}
            {newApiKey && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                                    <FaKey className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-900 text-lg">
                                        Save Your API Key!
                                    </h3>
                                    <p className="text-sm text-yellow-700">
                                        This is the only time you'll see this key. Copy it now.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNewApiKey(null)}
                                className="text-yellow-600 hover:text-yellow-800 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3">
                            <code className="flex-1 text-green-400 font-mono text-sm break-all">
                                {newApiKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(newApiKey)}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex-shrink-0"
                            >
                                <FaCopy /> Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Limit Warning */}
            {!canCreateMore && (
                <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="text-4xl">⚡</div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-bold text-lg">API Key Limit Reached</h3>
                            <p className="text-purple-100">
                                Upgrade your plan to create more API keys
                            </p>
                        </div>
                        <a
                            href="/billing"
                            className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition whitespace-nowrap"
                        >
                            Upgrade Plan
                        </a>
                    </div>
                </div>
            )}

            {/* API Keys List */}
            {apiKeys?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaKey className="text-gray-400" size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No API Keys Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first API key to start integrating</p>
                    {canCreateMore && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition"
                        >
                            Create First API Key
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {apiKeys?.map((key) => (
                        <ApiKeyCard
                            key={key._id}
                            apiKey={key}
                            onDelete={() => {
                                if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
                                    deleteMutation.mutate(key._id);
                                }
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Quick Start Guide */}
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-5xl">📚</div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-xl mb-2">API Documentation</h3>
                        <p className="text-blue-100">
                            Learn how to integrate WhatsApp messaging into your applications
                        </p>
                    </div>
                    <a
                        href="/api-docs"
                        className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition whitespace-nowrap shadow-lg"
                    >
                        View Docs →
                    </a>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateApiKeyModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={(data) => createMutation.mutate(data)}
                    isLoading={createMutation.isPending}
                />
            )}
        </div>
    );
}

// ==================== API KEY CARD COMPONENT ====================
function ApiKeyCard({ apiKey, onDelete }) {
    const [showPermissions, setShowPermissions] = useState(false);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition border border-gray-100">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <FaKey size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{apiKey.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Created:</span>
                                {formatDate(apiKey.createdAt)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Requests:</span>
                                <span className="font-semibold text-gray-700">{apiKey.totalRequests || 0}</span>
                            </span>
                            {apiKey.lastUsedAt && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-gray-400">Last used:</span>
                                        {formatDate(apiKey.lastUsedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                        
                        {/* Permissions */}
                        <div className="mt-3">
                            <button
                                onClick={() => setShowPermissions(!showPermissions)}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {showPermissions ? <FaEyeSlash /> : <FaEye />}
                                {showPermissions ? 'Hide' : 'Show'} Permissions
                            </button>
                            {showPermissions && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {apiKey.permissions?.map((perm, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                                        >
                                            <FaCheck size={10} />
                                            {perm.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                <button
                    onClick={onDelete}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Delete API key"
                >
                    <FaTrash size={18} />
                </button>
            </div>
            
            {/* Status */}
            <div className="mt-4 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${apiKey.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        </div>
    );
}

// ==================== CREATE API KEY MODAL ====================
function CreateApiKeyModal({ onClose, onCreate, isLoading }) {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState([
        'send_messages',
        'view_analytics'
    ]);

    const availablePermissions = [
        { value: 'send_messages', label: 'Send Messages', description: 'Send WhatsApp messages via API' },
        { value: 'manage_templates', label: 'Manage Templates', description: 'Create and manage message templates' },
        { value: 'manage_contacts', label: 'Manage Contacts', description: 'Add and manage contacts' },
        { value: 'view_analytics', label: 'View Analytics', description: 'Access analytics and reports' },
        { value: 'manage_campaigns', label: 'Manage Campaigns', description: 'Create and manage campaigns' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter a key name');
            return;
        }
        onCreate({ name: name.trim(), permissions });
    };

    const togglePermission = (perm) => {
        if (permissions.includes(perm)) {
            setPermissions(permissions.filter(p => p !== perm));
        } else {
            setPermissions([...permissions, perm]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create API Key</h2>
                            <p className="text-sm text-gray-500 mt-1">Generate a new API key for your application</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Key Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Production Server, Mobile App, Website"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            A descriptive name to identify this key
                        </p>
                    </div>
                    
                    {/* Permissions */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Permissions
                        </label>
                        <div className="space-y-3">
                            {availablePermissions.map((perm) => (
                                <label
                                    key={perm.value}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                                        permissions.includes(perm.value)
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes(perm.value)}
                                        onChange={() => togglePermission(perm.value)}
                                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{perm.label}</p>
                                        <p className="text-sm text-gray-500">{perm.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Creating...
                                </span>
                            ) : (
                                'Create API Key'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}