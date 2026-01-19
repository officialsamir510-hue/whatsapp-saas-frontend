import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
    const { user, tenant, updateTenant, updateUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [showApiKey, setShowApiKey] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: tenant?.company || tenant?.name || '',
    });

    // WhatsApp Config State
    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumberId: tenant?.whatsappConfig?.phoneNumberId || '',
        businessAccountId: tenant?.whatsappConfig?.businessAccountId || '',
        accessToken: tenant?.whatsappConfig?.accessToken || '',
    });

    // Webhook Config State
    const [webhookConfig, setWebhookConfig] = useState({
        webhookUrl: tenant?.webhookUrl || '',
        verifyToken: tenant?.verifyToken || 'wabmeta_whatsapp_1617',
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            const data = response.data.data;
            
            if (data.whatsappConfig) {
                setWhatsappConfig(data.whatsappConfig);
            }
            if (data.webhookConfig) {
                setWebhookConfig(data.webhookConfig);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, label = 'Text') => {
        if (!text) {
            toast.error('Nothing to copy!');
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const regenerateApiKey = async () => {
        if (!confirm('Are you sure? Your current API key will stop working immediately.')) return;
        
        setRegenerating(true);
        try {
            const response = await api.post('/auth/regenerate-api-key');
            updateTenant({ apiKey: response.data.data.apiKey });
            toast.success('API Key regenerated successfully!');
            setShowApiKey(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to regenerate API key');
        } finally {
            setRegenerating(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/settings/profile', profileData);
            updateUser({ name: profileData.name, email: profileData.email });
            updateTenant({ company: profileData.company });
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const updateWhatsAppConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/settings/whatsapp', whatsappConfig);
            updateTenant({ whatsappConfig: response.data.data });
            toast.success('WhatsApp configuration updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update WhatsApp config');
        } finally {
            setSaving(false);
        }
    };

    const updateWebhookConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/settings/webhook', webhookConfig);
            updateTenant({ webhookConfig: response.data.data });
            toast.success('Webhook configuration updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update webhook config');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }

        setSaving(true);
        try {
            await api.put('/settings/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const testWebhook = async () => {
        try {
            const response = await api.post('/settings/webhook/test');
            toast.success('Test webhook sent successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to test webhook');
        }
    };

    const tabs = [
        { id: 'profile', label: '👤 Profile', icon: '👤' },
        { id: 'api', label: '🔑 API Credentials', icon: '🔑' },
        { id: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
        { id: 'webhook', label: '🔗 Webhook', icon: '🔗' },
        { id: 'security', label: '🔒 Security', icon: '🔒' },
        { id: 'usage', label: '📊 Usage', icon: '📊' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account and application settings</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                        <form onSubmit={updateProfile}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Plan
                                    </label>
                                    <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium capitalize">
                                        {tenant?.plan || 'Free'}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* API Credentials Tab */}
                {activeTab === 'api' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-6">API Credentials</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tenant ID
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                                        {tenant?._id}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(tenant?._id, 'Tenant ID')}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                                        {showApiKey ? tenant?.apiKey : '•'.repeat(40)}
                                    </code>
                                    <button
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        {showApiKey ? '🙈 Hide' : '👁️ Show'}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(tenant?.apiKey, 'API Key')}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <button
                                    onClick={regenerateApiKey}
                                    disabled={regenerating}
                                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 disabled:opacity-50 font-medium"
                                >
                                    {regenerating ? '⏳ Regenerating...' : '🔄 Regenerate API Key'}
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    ⚠️ Warning: Regenerating will invalidate your current API key immediately
                                </p>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">API Documentation</h3>
                                <p className="text-sm text-blue-700 mb-3">
                                    Use these credentials to authenticate your API requests.
                                </p>
                                <pre className="bg-blue-900 text-blue-100 p-4 rounded text-xs overflow-x-auto">
{`curl -X POST ${window.location.origin.replace('3000', '8000')}/api/messages/send \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1234567890",
    "message": "Hello from WhatsApp!"
  }'`}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* WhatsApp Tab */}
                {activeTab === 'whatsapp' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-6">WhatsApp Business Configuration</h2>
                        <form onSubmit={updateWhatsAppConfig}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number ID
                                    </label>
                                    <input
                                        type="text"
                                        value={whatsappConfig.phoneNumberId}
                                        onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumberId: e.target.value })}
                                        placeholder="123456789012345"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Found in Meta Business Suite → WhatsApp → API Setup
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Business Account ID
                                    </label>
                                    <input
                                        type="text"
                                        value={whatsappConfig.businessAccountId}
                                        onChange={(e) => setWhatsappConfig({ ...whatsappConfig, businessAccountId: e.target.value })}
                                        placeholder="123456789012345"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Access Token
                                    </label>
                                    <textarea
                                        value={whatsappConfig.accessToken}
                                        onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accessToken: e.target.value })}
                                        placeholder="EAAxxxxxxxxxx..."
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Generate a permanent token from Meta Business Suite
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Webhook Tab */}
                {activeTab === 'webhook' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-6">Webhook Configuration</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Webhook URL (for Meta)
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                                        {window.location.origin.replace('3000', '8000')}/api/webhook
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(
                                            `${window.location.origin.replace('3000', '8000')}/api/webhook`,
                                            'Webhook URL'
                                        )}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verify Token
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm">
                                        {webhookConfig.verifyToken}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(webhookConfig.verifyToken, 'Verify Token')}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={testWebhook}
                                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    🧪 Test Webhook
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h3 className="font-semibold text-yellow-900 mb-2">📝 Setup Instructions</h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                                    <li>Go to Meta Business Suite → WhatsApp → Configuration</li>
                                    <li>Click "Configure Webhooks"</li>
                                    <li>Paste the Webhook URL above</li>
                                    <li>Paste the Verify Token above</li>
                                    <li>Subscribe to: messages, message_status</li>
                                    <li>Click "Verify and Save"</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                        
                        <form onSubmit={changePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    minLength="6"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    minLength="6"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Usage Tab */}
                {activeTab === 'usage' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-6">Usage Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                                    <p className="text-3xl font-bold text-green-600 mb-2">
                                        {tenant?.messageCredits?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-sm text-green-700 font-medium">Credits Remaining</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                                    <p className="text-3xl font-bold text-blue-600 mb-2">
                                        {tenant?.totalMessagesSent?.toLocaleString() || 0}
                                    </p>
                                    <p className="text-sm text-blue-700 font-medium">Messages Sent</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                                    <p className="text-3xl font-bold text-purple-600 mb-2 capitalize">
                                        {tenant?.plan || 'Free'}
                                    </p>
                                    <p className="text-sm text-purple-700 font-medium">Current Plan</p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                                    <p className="text-3xl font-bold text-gray-600 mb-2 capitalize">
                                        {user?.role || 'User'}
                                    </p>
                                    <p className="text-sm text-gray-700 font-medium">Your Role</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Plan Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">Plan Type</span>
                                    <span className="font-medium capitalize">{tenant?.plan || 'Free'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">Credits Used</span>
                                    <span className="font-medium">{tenant?.totalMessagesSent || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">Credits Remaining</span>
                                    <span className="font-medium text-green-600">{tenant?.messageCredits || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Member Since</span>
                                    <span className="font-medium">
                                        {new Date(tenant?.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}