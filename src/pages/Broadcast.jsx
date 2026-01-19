import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Broadcast() {
    const { tenant } = useAuthStore();
    
    // State Management
    const [step, setStep] = useState(1); // 1: Select Recipients, 2: Compose, 3: Preview, 4: Sending, 5: Results
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [allTags, setAllTags] = useState([]);
    
    // Message
    const [messageType, setMessageType] = useState('text'); // text, template, media
    const [message, setMessage] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaType, setMediaType] = useState('image'); // image, video, document
    const [caption, setCaption] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templates, setTemplates] = useState([]);
    
    // Scheduling
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    
    // Results
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState({ sent: 0, total: 0 });
    
    // CSV Import
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [csvNumbers, setCsvNumbers] = useState('');
    const fileInputRef = useRef(null);

    // Broadcast History
    const [showHistory, setShowHistory] = useState(false);
    const [broadcastHistory, setBroadcastHistory] = useState([]);

    // Fetch Contacts
    useEffect(() => {
        fetchContacts();
        fetchTags();
        fetchTemplates();
    }, [searchQuery, selectedTag]);

    const fetchContacts = async () => {
        try {
            let url = `/contacts?limit=500`;
            if (searchQuery) url += `&search=${searchQuery}`;
            if (selectedTag) url += `&tag=${selectedTag}`;
            
            const response = await api.get(url);
            setContacts(response.data.data.contacts || []);
        } catch (err) {
            console.error('Error fetching contacts:', err);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await api.get('/contacts/tags');
            setAllTags(response.data.data || []);
        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await api.get('/templates');
            setTemplates(response.data.data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    };

    // Selection Handlers
    const toggleContact = (waId) => {
        if (selectedContacts.includes(waId)) {
            setSelectedContacts(selectedContacts.filter(id => id !== waId));
        } else {
            setSelectedContacts([...selectedContacts, waId]);
        }
    };

    const selectAll = () => {
        if (selectedContacts.length === contacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.map(c => c.waId));
        }
    };

    const selectByTag = (tag) => {
        const tagContacts = contacts.filter(c => c.tags?.includes(tag)).map(c => c.waId);
        const newSelected = [...new Set([...selectedContacts, ...tagContacts])];
        setSelectedContacts(newSelected);
        toast.success(`Added ${tagContacts.length} contacts with tag "${tag}"`);
    };

    // CSV Import
    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const numbers = [];
            
            lines.forEach(line => {
                const parts = line.split(',');
                const phone = parts[0]?.toString().replace(/[\s\-\+\(\)]/g, '').trim();
                if (phone && phone.length >= 10) {
                    numbers.push(phone);
                }
            });

            if (numbers.length > 0) {
                setSelectedContacts([...new Set([...selectedContacts, ...numbers])]);
                toast.success(`Added ${numbers.length} numbers from CSV`);
            } else {
                toast.error('No valid phone numbers found in CSV');
            }
        };
        reader.readAsText(file);
    };

    const handleManualNumbers = () => {
        const lines = csvNumbers.split('\n');
        const numbers = [];
        
        lines.forEach(line => {
            const phone = line.toString().replace(/[\s\-\+\(\),]/g, '').trim();
            if (phone && phone.length >= 10) {
                numbers.push(phone);
            }
        });

        if (numbers.length > 0) {
            setSelectedContacts([...new Set([...selectedContacts, ...numbers])]);
            toast.success(`Added ${numbers.length} numbers`);
            setCsvNumbers('');
            setShowCsvImport(false);
        } else {
            toast.error('No valid phone numbers found');
        }
    };

    // Message Preview with Variables
    const getPreviewMessage = (contactName = 'Customer') => {
        return message
            .replace(/\{\{name\}\}/gi, contactName)
            .replace(/\{\{1\}\}/g, contactName)
            .replace(/\{\{company\}\}/gi, tenant?.name || 'Company')
            .replace(/\{\{date\}\}/gi, new Date().toLocaleDateString());
    };

    // Character Counter
    const getCharacterInfo = () => {
        const length = message.length;
        const smsCount = Math.ceil(length / 160) || 1;
        return { length, smsCount };
    };

    // Send Broadcast
    const handleBroadcast = async () => {
        if (selectedContacts.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        if (messageType === 'text' && !message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (messageType === 'media' && !mediaUrl.trim()) {
            toast.error('Please enter media URL');
            return;
        }

        // Check credits
        if (tenant?.messageCredits < selectedContacts.length) {
            toast.error(`Insufficient credits. Need ${selectedContacts.length}, have ${tenant?.messageCredits}`);
            return;
        }

        setStep(4);
        setSending(true);
        setProgress({ sent: 0, total: selectedContacts.length });

        try {
            const payload = {
                recipients: selectedContacts,
                type: messageType,
                message: message.trim(),
            };

            if (messageType === 'template') {
                payload.templateName = templateName;
            }

            if (messageType === 'media') {
                payload.mediaUrl = mediaUrl;
                payload.mediaType = mediaType;
                payload.caption = caption;
            }

            const response = await api.post('/messages/broadcast', payload);
            
            setResults(response.data.data);
            setStep(5);
            toast.success(`Broadcast complete! ${response.data.data.successful} sent successfully`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Broadcast failed');
            setStep(3);
        } finally {
            setSending(false);
        }
    };

    // Reset Form
    const resetForm = () => {
        setStep(1);
        setSelectedContacts([]);
        setMessage('');
        setMediaUrl('');
        setCaption('');
        setResults(null);
        setProgress({ sent: 0, total: 0 });
    };

    // Download Results
    const downloadResults = () => {
        if (!results) return;
        
        let csv = 'Phone,Status,Error\n';
        results.results?.success?.forEach(phone => {
            csv += `${phone},Success,\n`;
        });
        results.results?.failed?.forEach(item => {
            csv += `${item.recipient},Failed,"${item.error?.message || 'Unknown error'}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `broadcast_results_${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📢 Broadcast Messages</h1>
                    <p className="text-gray-600">Send messages to multiple contacts at once</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        📜 History
                    </button>
                    {step !== 1 && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            ← Start Over
                        </button>
                    )}
                </div>
            </div>

            {/* Credits Warning */}
            {tenant?.messageCredits < 100 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-medium text-yellow-800">Low Credits Warning</p>
                        <p className="text-sm text-yellow-700">
                            You have only <strong>{tenant?.messageCredits}</strong> credits remaining. 
                            <a href="/billing" className="text-yellow-800 underline ml-1">Buy more credits</a>
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    {[
                        { num: 1, label: 'Select Recipients' },
                        { num: 2, label: 'Compose Message' },
                        { num: 3, label: 'Preview & Send' },
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition ${
                                step >= s.num 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-500'
                            }`}>
                                {step > s.num ? '✓' : s.num}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${
                                step >= s.num ? 'text-green-600' : 'text-gray-500'
                            }`}>
                                {s.label}
                            </span>
                            {i < 2 && (
                                <div className={`w-16 h-1 mx-4 rounded ${
                                    step > s.num ? 'bg-green-500' : 'bg-gray-200'
                                }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Select Recipients */}
            {step === 1 && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow p-4">
                            <p className="text-gray-500 text-sm">Total Contacts</p>
                            <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4">
                            <p className="text-gray-500 text-sm">Selected</p>
                            <p className="text-2xl font-bold text-green-600">{selectedContacts.length}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4">
                            <p className="text-gray-500 text-sm">Available Credits</p>
                            <p className="text-2xl font-bold text-blue-600">{tenant?.messageCredits || 0}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow p-4">
                            <p className="text-gray-500 text-sm">Credits Needed</p>
                            <p className={`text-2xl font-bold ${
                                selectedContacts.length > (tenant?.messageCredits || 0) 
                                    ? 'text-red-600' 
                                    : 'text-gray-900'
                            }`}>
                                {selectedContacts.length}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Contact Selection */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow">
                            {/* Filters */}
                            <div className="p-4 border-b space-y-3">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                        <input
                                            type="text"
                                            placeholder="Search contacts..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">All Tags</option>
                                        {allTags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={selectAll}
                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
                                    >
                                        {selectedContacts.length === contacts.length ? '❌ Deselect All' : '✅ Select All'}
                                    </button>
                                    <button
                                        onClick={() => setShowCsvImport(true)}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition"
                                    >
                                        📄 Import Numbers
                                    </button>
                                    {allTags.slice(0, 3).map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => selectByTag(tag)}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                                        >
                                            🏷️ {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contact List */}
                            <div className="max-h-[500px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                                        <p className="mt-2 text-gray-500">Loading contacts...</p>
                                    </div>
                                ) : contacts.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <div className="text-5xl mb-4">👥</div>
                                        <p>No contacts found</p>
                                        <a href="/contacts" className="text-green-600 hover:underline">Add contacts first</a>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                                                        onChange={selectAll}
                                                        className="w-4 h-4 text-green-500 rounded"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {contacts.map((contact) => (
                                                <tr 
                                                    key={contact._id}
                                                    onClick={() => toggleContact(contact.waId)}
                                                    className={`cursor-pointer transition ${
                                                        selectedContacts.includes(contact.waId) 
                                                            ? 'bg-green-50' 
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedContacts.includes(contact.waId)}
                                                            onChange={() => toggleContact(contact.waId)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-4 h-4 text-green-500 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                                {(contact.name || contact.phone)?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span className="font-medium">{contact.name || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{contact.phone}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {contact.tags?.slice(0, 2).map((tag, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {contact.tags?.length > 2 && (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                                    +{contact.tags.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Selected Summary */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="font-semibold text-lg mb-4">📋 Selected Recipients</h3>
                            
                            <div className="mb-4 p-4 bg-green-50 rounded-lg text-center">
                                <p className="text-4xl font-bold text-green-600">{selectedContacts.length}</p>
                                <p className="text-sm text-green-700">contacts selected</p>
                            </div>

                            {/* Selected List Preview */}
                            <div className="max-h-[300px] overflow-y-auto mb-4">
                                {selectedContacts.slice(0, 20).map((waId, i) => {
                                    const contact = contacts.find(c => c.waId === waId);
                                    return (
                                        <div key={i} className="flex items-center justify-between py-2 border-b">
                                            <span className="text-sm truncate">
                                                {contact?.name || waId}
                                            </span>
                                            <button
                                                onClick={() => toggleContact(waId)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                                {selectedContacts.length > 20 && (
                                    <p className="text-center text-gray-500 text-sm py-2">
                                        +{selectedContacts.length - 20} more
                                    </p>
                                )}
                            </div>

                            {selectedContacts.length > 0 && (
                                <button
                                    onClick={() => setSelectedContacts([])}
                                    className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                                >
                                    Clear All
                                </button>
                            )}

                            {/* Next Button */}
                            <button
                                onClick={() => setStep(2)}
                                disabled={selectedContacts.length === 0}
                                className="w-full mt-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Continue to Compose →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Compose Message */}
            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Compose Area */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-lg mb-4">✍️ Compose Message</h3>

                        {/* Message Type Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                            <div className="flex gap-2">
                                {[
                                    { type: 'text', icon: '💬', label: 'Text' },
                                    { type: 'media', icon: '📷', label: 'Media' },
                                    { type: 'template', icon: '📝', label: 'Template' },
                                ].map((t) => (
                                    <button
                                        key={t.type}
                                        onClick={() => setMessageType(t.type)}
                                        className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                                            messageType === t.type
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span>{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Text Message */}
                        {messageType === 'text' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message Content
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message here...

Use variables:
{{name}} - Contact's name
{{company}} - Your company name
{{date}} - Today's date"
                                        rows={8}
                                        className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 resize-none"
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                                        <span>{getCharacterInfo().length} characters</span>
                                        <span>{getCharacterInfo().smsCount} SMS segment(s)</span>
                                    </div>
                                </div>

                                {/* Quick Templates */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Greeting', text: 'Hello {{name}}! 👋' },
                                            { label: 'Promo', text: '🎉 Special offer for you {{name}}! Get 20% off today only.' },
                                            { label: 'Reminder', text: 'Hi {{name}}, this is a friendly reminder from {{company}}.' },
                                            { label: 'Thank You', text: 'Thank you {{name}} for choosing {{company}}! 🙏' },
                                        ].map((t, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setMessage(t.text)}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Emoji Picker */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Emoji</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['👋', '🎉', '🔥', '❤️', '✅', '📢', '⭐', '🎁', '💰', '🚀', '👍', '🙏'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => setMessage(message + emoji)}
                                                className="text-2xl hover:scale-125 transition"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Media Message */}
                        {messageType === 'media' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                                    <div className="flex gap-2">
                                        {[
                                            { type: 'image', icon: '🖼️', label: 'Image' },
                                            { type: 'video', icon: '🎥', label: 'Video' },
                                            { type: 'document', icon: '📄', label: 'Document' },
                                        ].map((t) => (
                                            <button
                                                key={t.type}
                                                onClick={() => setMediaType(t.type)}
                                                className={`flex-1 py-2 rounded-lg font-medium transition ${
                                                    mediaType === t.type
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {t.icon} {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Media URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter a publicly accessible URL</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Add a caption..."
                                        rows={3}
                                        className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Template Message */}
                        {messageType === 'template' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                                    {templates.length === 0 ? (
                                        <div className="p-6 bg-gray-50 rounded-lg text-center">
                                            <p className="text-gray-500 mb-2">No templates found</p>
                                            <a href="/templates" className="text-green-600 hover:underline">Create templates first</a>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {templates.map((template) => (
                                                <div
                                                    key={template._id}
                                                    onClick={() => {
                                                        setTemplateName(template.name);
                                                        setMessage(template.components?.find(c => c.type === 'BODY')?.text || '');
                                                    }}
                                                    className={`p-4 border rounded-lg cursor-pointer transition ${
                                                        templateName === template.name
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{template.name}</p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {template.components?.find(c => c.type === 'BODY')?.text?.substring(0, 100)}...
                                                            </p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            template.status === 'APPROVED' 
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {template.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={
                                    (messageType === 'text' && !message.trim()) ||
                                    (messageType === 'media' && !mediaUrl.trim()) ||
                                    (messageType === 'template' && !templateName)
                                }
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Preview →
                            </button>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-lg mb-4">📱 Message Preview</h3>
                        
                        {/* Phone Mockup */}
                        <div className="bg-gray-800 rounded-3xl p-4 max-w-sm mx-auto">
                            <div className="bg-gray-900 rounded-2xl p-2">
                                {/* Status Bar */}
                                <div className="flex justify-between items-center px-2 py-1 text-white text-xs">
                                    <span>9:41</span>
                                    <div className="flex gap-1">
                                        <span>📶</span>
                                        <span>🔋</span>
                                    </div>
                                </div>
                                
                                {/* Chat Header */}
                                <div className="bg-green-700 px-3 py-2 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                    <div className="text-white">
                                        <p className="font-medium text-sm">Recipient Name</p>
                                        <p className="text-xs text-green-200">online</p>
                                    </div>
                                </div>

                                {/* Chat Background */}
                                <div className="bg-[#e5ddd5] min-h-[300px] p-3 relative" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ccc' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                                }}>
                                    {/* Message Bubble */}
                                    <div className="flex justify-end">
                                        <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%] shadow">
                                            {messageType === 'media' && mediaUrl && (
                                                <div className="mb-2">
                                                    {mediaType === 'image' && (
                                                        <div className="bg-gray-200 rounded h-32 flex items-center justify-center">
                                                            🖼️ Image
                                                        </div>
                                                    )}
                                                    {mediaType === 'video' && (
                                                        <div className="bg-gray-200 rounded h-32 flex items-center justify-center">
                                                            🎥 Video
                                                        </div>
                                                    )}
                                                    {mediaType === 'document' && (
                                                        <div className="bg-gray-200 rounded p-3 flex items-center gap-2">
                                                            📄 Document
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {messageType === 'media' ? caption || '(No caption)' : getPreviewMessage('John')}
                                            </p>
                                            <div className="text-right mt-1">
                                                <span className="text-[10px] text-gray-500">9:41 ✓✓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recipient Info */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Recipients:</strong> {selectedContacts.length} contacts
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                <strong>Credits to be used:</strong> {selectedContacts.length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                <strong>Credits remaining after:</strong>{' '}
                                <span className={
                                    (tenant?.messageCredits || 0) - selectedContacts.length < 0
                                        ? 'text-red-600 font-bold'
                                        : 'text-green-600 font-bold'
                                }>
                                    {(tenant?.messageCredits || 0) - selectedContacts.length}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Preview & Confirm */}
            {step === 3 && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-xl mb-6 text-center">🚀 Ready to Send?</h3>
                        
                        {/* Summary */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Recipients</span>
                                <span className="font-semibold">{selectedContacts.length} contacts</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Message Type</span>
                                <span className="font-semibold capitalize">{messageType}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Credits Required</span>
                                <span className="font-semibold">{selectedContacts.length}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                                <span className="text-gray-600">Your Credits</span>
                                <span className={`font-semibold ${
                                    (tenant?.messageCredits || 0) >= selectedContacts.length
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {tenant?.messageCredits || 0}
                                </span>
                            </div>
                        </div>

                        {/* Message Preview */}
                        <div className="p-4 bg-gray-50 rounded-lg mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Message Preview:</p>
                            <p className="text-gray-800 whitespace-pre-wrap">
                                {messageType === 'media' ? caption || '[Media message]' : getPreviewMessage('{{name}}')}
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                            <p className="text-sm text-yellow-800">
                                <strong>⚠️ Important:</strong> This action will send messages to {selectedContacts.length} recipients
                                and deduct {selectedContacts.length} credits from your account. This cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                ← Edit Message
                            </button>
                            <button
                                onClick={handleBroadcast}
                                disabled={(tenant?.messageCredits || 0) < selectedContacts.length}
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                🚀 Send Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Sending Progress */}
            {step === 4 && (
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="animate-spin h-10 w-10 text-green-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Sending Messages...</h3>
                            <p className="text-gray-500 mt-1">Please wait while we deliver your messages</p>
                        </div>
                        
                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{progress.sent} / {progress.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.sent / progress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500">
                            Do not close this page until the process is complete
                        </p>
                    </div>
                </div>
            )}

            {/* Step 5: Results */}
            {step === 5 && results && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Broadcast Complete!</h3>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-gray-900">{results.total}</p>
                                <p className="text-sm text-gray-600">Total</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-green-600">{results.successful}</p>
                                <p className="text-sm text-gray-600">Successful</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-red-600">{results.failed}</p>
                                <p className="text-sm text-gray-600">Failed</p>
                            </div>
                        </div>

                        {/* Success Rate */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Success Rate</span>
                                <span>{((results.successful / results.total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-green-500 h-3 rounded-full"
                                    style={{ width: `${(results.successful / results.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Failed Recipients */}
                        {results.results?.failed?.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-red-600 mb-3">❌ Failed Recipients:</h4>
                                <div className="max-h-40 overflow-y-auto bg-red-50 rounded-lg p-3">
                                    {results.results.failed.map((item, i) => (
                                        <div key={i} className="flex justify-between py-1 text-sm border-b border-red-100 last:border-0">
                                            <span className="font-mono">{item.recipient}</span>
                                            <span className="text-red-600">{item.error?.message || 'Failed'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={downloadResults}
                                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                            >
                                📥 Download Report
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
                            >
                                New Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            {showCsvImport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">📄 Import Phone Numbers</h3>
                            <button onClick={() => setShowCsvImport(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                                ×
                            </button>
                        </div>

                        {/* Upload CSV */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleCsvUpload}
                                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-green-500 transition"
                            />
                            <p className="text-xs text-gray-500 mt-2">CSV should have phone numbers in the first column</p>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-gray-400 text-sm">OR</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Manual Entry */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Paste Phone Numbers</label>
                            <textarea
                                value={csvNumbers}
                                onChange={(e) => setCsvNumbers(e.target.value)}
                                placeholder="Enter phone numbers (one per line):
919876543210
918765432109
917654321098"
                                rows={6}
                                className="w-full border rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCsvImport(false)}
                                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleManualNumbers}
                                disabled={!csvNumbers.trim()}
                                className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition"
                            >
                                Add Numbers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}