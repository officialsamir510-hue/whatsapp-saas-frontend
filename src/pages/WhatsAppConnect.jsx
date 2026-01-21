import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaSync, FaTrash, FaPhone, FaCheckCircle, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function WhatsAppConnect() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [connecting, setConnecting] = useState(false);

    // Check for OAuth callback
    useEffect(() => {
        const connected = searchParams.get('connected');
        const message = searchParams.get('message');

        if (connected === 'success') {
            toast.success('WhatsApp Business connected successfully!');
            queryClient.invalidateQueries(['whatsapp-accounts']);
            navigate('/whatsapp-connect', { replace: true });
        } else if (connected === 'error') {
            toast.error(message || 'Failed to connect WhatsApp Business');
            navigate('/whatsapp-connect', { replace: true });
        }
    }, [searchParams, navigate, queryClient]);

    // Fetch connected accounts
    const { data: accounts, isLoading } = useQuery({
        queryKey: ['whatsapp-accounts'],
        queryFn: async () => {
            const { data } = await api.get('/whatsapp/oauth/accounts');
            return data.data.accounts;
        }
    });

    // Connect WhatsApp
    const handleConnect = async () => {
        try {
            setConnecting(true);

            // Get OAuth URL
            const { data } = await api.get('/whatsapp/oauth/init');
            
            // Redirect to Meta OAuth
            window.location.href = data.data.oauthUrl;

        } catch (error) {
            console.error('Connect error:', error);
            
            if (error.response?.data?.upgrade) {
                toast.error('Please upgrade your plan to connect more accounts');
            } else {
                toast.error(error.response?.data?.message || 'Failed to connect');
            }
            
            setConnecting(false);
        }
    };

    // Disconnect account
    const disconnectMutation = useMutation({
        mutationFn: (wabaId) => api.delete(`/whatsapp/oauth/accounts/${wabaId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['whatsapp-accounts']);
            toast.success('Account disconnected successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to disconnect');
        }
    });

    // Sync account
    const syncMutation = useMutation({
        mutationFn: (wabaId) => api.post(`/whatsapp/oauth/accounts/${wabaId}/sync`),
        onSuccess: () => {
            queryClient.invalidateQueries(['whatsapp-accounts']);
            toast.success('Account synced successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to sync');
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading WhatsApp accounts...</p>
                </div>
            </div>
        );
    }

    const connectedCount = accounts?.length || 0;
    const maxAccounts = user?.planLimits?.whatsappAccountsLimit || 1;
    const canConnect = connectedCount < maxAccounts;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    WhatsApp Business Accounts
                </h1>
                <p className="text-lg text-gray-600">
                    Connect and manage your Meta WhatsApp Business accounts
                </p>
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Connected:</span>
                        <span className="text-lg font-bold text-gray-900">
                            {connectedCount} / {maxAccounts}
                        </span>
                    </div>
                    {!canConnect && (
                        <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                            <FaExclamationTriangle className="text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Limit reached</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Connect Button */}
            {canConnect && (
                <div className="mb-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                                <FaWhatsapp size={56} className="text-white" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-3xl font-bold text-white mb-3">
                                    Connect WhatsApp Business
                                </h2>
                                <p className="text-green-100 text-lg mb-4">
                                    Link your Meta Business account to send and receive WhatsApp messages at scale
                                </p>
                                <div className="flex flex-wrap gap-3 text-sm text-green-100">
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-green-200" />
                                        <span>Official WhatsApp API</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-green-200" />
                                        <span>Verified Business Badge</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-green-200" />
                                        <span>Rich Media Support</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleConnect}
                                disabled={connecting}
                                className="flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                {connecting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        Connect with Meta
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Connected Accounts */}
            {accounts?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaWhatsapp className="text-green-500" size={64} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        No WhatsApp Accounts Connected
                    </h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                        Connect your first WhatsApp Business account to start sending messages to your customers
                    </p>
                    {canConnect && (
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition shadow-lg"
                        >
                            Get Started
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {accounts?.map((account) => (
                        <WhatsAppAccountCard
                            key={account.wabaId}
                            account={account}
                            onDisconnect={() => {
                                if (confirm('Are you sure you want to disconnect this WhatsApp Business account? This will stop all messaging functionality.')) {
                                    disconnectMutation.mutate(account.wabaId);
                                }
                            }}
                            onSync={() => syncMutation.mutate(account.wabaId)}
                            isSyncing={syncMutation.isPending}
                        />
                    ))}
                </div>
            )}

            {/* Upgrade Notice */}
            {!canConnect && (
                <div className="mt-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="text-6xl">⚡</div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-2xl text-white mb-2">
                                    Account Limit Reached
                                </h3>
                                <p className="text-purple-100 text-lg">
                                    Upgrade your plan to connect more WhatsApp Business accounts and scale your messaging
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/billing')}
                                className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition shadow-lg"
                            >
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">📚</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-2 text-lg">Setup Guide</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Create a Meta Business Account at business.facebook.com</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Set up WhatsApp Business API in Meta Business Manager</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Verify your phone number and business details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Click "Connect with Meta" button above</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">💡</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 mb-2 text-lg">Requirements</h3>
                            <ul className="space-y-2 text-sm text-amber-800">
                                <li className="flex items-start gap-2">
                                    <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>Meta Business Account (verified)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>WhatsApp Business Account with admin access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>Verified business phone number</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>Business display name approved by Meta</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* External Links */}
            <div className="mt-8 flex flex-wrap gap-4">
                <a
                    href="https://business.facebook.com/latest/whatsapp_manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border-2 border-gray-300 px-6 py-3 rounded-xl font-semibold text-gray-700 hover:border-green-500 hover:text-green-600 transition"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Open Meta Business Manager
                </a>
                <a
                    href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border-2 border-gray-300 px-6 py-3 rounded-xl font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
                >
                    <span className="text-xl">📖</span>
                    WhatsApp API Documentation
                </a>
            </div>
        </div>
    );
}

// ==================== WHATSAPP ACCOUNT CARD ====================
function WhatsAppAccountCard({ account, onDisconnect, onSync, isSyncing }) {
    const [showPhones, setShowPhones] = useState(false);
    const queryClient = useQueryClient();

    const setDefaultMutation = useMutation({
        mutationFn: (phoneNumberId) => 
            api.put(`/whatsapp/oauth/accounts/${account.wabaId}/phone/${phoneNumberId}/default`),
        onSuccess: () => {
            queryClient.invalidateQueries(['whatsapp-accounts']);
            toast.success('Default phone number updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update default phone');
        }
    });

    const getQualityColor = (rating) => {
        switch (rating?.toUpperCase()) {
            case 'GREEN': return 'bg-green-100 text-green-700 border-green-300';
            case 'YELLOW': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'RED': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'limited': return 'bg-yellow-500';
            case 'suspended': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <FaWhatsapp size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                {account.accountName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(account.status)}`}></div>
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {account.status}
                                    </span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">
                                    {account.phoneNumbers?.length || 0} phone number(s)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onSync}
                            disabled={isSyncing}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition disabled:opacity-50"
                            title="Sync account data"
                        >
                            <FaSync className={isSyncing ? 'animate-spin' : ''} size={18} />
                        </button>
                        <button
                            onClick={onDisconnect}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Disconnect account"
                        >
                            <FaTrash size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Details */}
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Business ID</p>
                        <p className="text-sm font-mono text-gray-900 truncate" title={account.businessId}>
                            {account.businessId}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-medium">WABA ID</p>
                        <p className="text-sm font-mono text-gray-900 truncate" title={account.wabaId}>
                            {account.wabaId}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Timezone</p>
                        <p className="text-sm font-medium text-gray-900">
                            {account.timezone || 'UTC'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Last Synced</p>
                        <p className="text-sm font-medium text-gray-900">
                            {formatDate(account.lastSyncedAt)}
                        </p>
                    </div>
                </div>

                {/* Phone Numbers */}
                <div>
                    <button
                        onClick={() => setShowPhones(!showPhones)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition border border-gray-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-300">
                                <FaPhone className="text-gray-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">
                                    Phone Numbers ({account.phoneNumbers?.length || 0})
                                </p>
                                <p className="text-xs text-gray-600">
                                    Click to {showPhones ? 'hide' : 'view'} details
                                </p>
                            </div>
                        </div>
                        <svg
                            className={`w-6 h-6 text-gray-600 transition-transform ${showPhones ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showPhones && (
                        <div className="mt-4 space-y-3">
                            {account.phoneNumbers?.map((phone) => (
                                <div
                                    key={phone.phoneNumberId}
                                    className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 transition bg-white"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="font-mono font-bold text-lg text-gray-900">
                                                +{phone.displayPhoneNumber}
                                            </p>
                                            {phone.isDefault && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-300">
                                                    <FaStar size={10} />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600 font-medium">
                                                {phone.verifiedName}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getQualityColor(phone.qualityRating)}`}>
                                                {phone.qualityRating || 'UNKNOWN'}
                                            </span>
                                        </div>
                                    </div>
                                    {!phone.isDefault && (
                                        <button
                                            onClick={() => setDefaultMutation.mutate(phone.phoneNumberId)}
                                            disabled={setDefaultMutation.isPending}
                                            className="px-5 py-2 text-sm text-green-600 hover:bg-green-50 border-2 border-green-300 rounded-lg font-semibold transition disabled:opacity-50"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}