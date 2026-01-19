import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'MARKETING',
        language: 'en',
        bodyText: ''
    });
    const [saving, setSaving] = useState(false);

    const fetchTemplates = async () => {
        try {
            const response = await api.get('/templates');
            setTemplates(response.data.data || []);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.bodyText) {
            toast.error('Name and body text are required');
            return;
        }

        setSaving(true);
        try {
            await api.post('/templates', {
                name: formData.name,
                category: formData.category,
                language: formData.language,
                components: [{ type: 'BODY', text: formData.bodyText }]
            });
            toast.success('Template created!');
            setShowModal(false);
            setFormData({ name: '', category: 'MARKETING', language: 'en', bodyText: '' });
            fetchTemplates();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this template?')) return;
        try {
            await api.delete(`/templates/${id}`);
            toast.success('Deleted');
            fetchTemplates();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Message Templates</h1>
                    <p className="text-gray-600">Create and manage WhatsApp templates</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                    + New Template
                </button>
            </div>

            {/* Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                Templates need to be approved by WhatsApp. Create templates here and submit them through Meta Business Suite.
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : templates.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No templates yet. Create your first template!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold">{template.name}</h3>
                                <span className={`text-xs px-2 py-1 rounded ${
                                    template.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    template.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {template.status || 'PENDING'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                                {template.category} • {template.language}
                            </p>
                            <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
                                {template.components?.find(c => c.type === 'BODY')?.text || 'No body text'}
                            </div>
                            <button
                                onClick={() => handleDelete(template._id)}
                                className="text-red-600 text-sm hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">New Template</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Template Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                                    className="w-full border rounded-lg px-4 py-2"
                                    placeholder="hello_world"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Lowercase with underscores only</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full border rounded-lg px-4 py-2"
                                    >
                                        <option value="MARKETING">Marketing</option>
                                        <option value="UTILITY">Utility</option>
                                        <option value="AUTHENTICATION">Authentication</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Language</label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                                        className="w-full border rounded-lg px-4 py-2"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message Body *</label>
                                <textarea
                                    value={formData.bodyText}
                                    onChange={(e) => setFormData({...formData, bodyText: e.target.value})}
                                    className="w-full border rounded-lg px-4 py-2"
                                    rows={4}
                                    placeholder="Hello {{1}}, your order {{2}} is confirmed!"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-green-500 text-white py-2 rounded-lg disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}