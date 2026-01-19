import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', tags: '' });
    const [importData, setImportData] = useState('');
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [allTags, setAllTags] = useState([]);
    
    // CSV Import States
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [columnMapping, setColumnMapping] = useState({
        phone: '',
        name: '',
        email: '',
        tags: ''
    });
    const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Map, 3: Preview
    const fileInputRef = useRef(null);

    const fetchContacts = async () => {
        try {
            let url = `/contacts?limit=100`;
            if (search) url += `&search=${search}`;
            if (selectedTag) url += `&tag=${selectedTag}`;
            
            const response = await api.get(url);
            setContacts(response.data.data.contacts || []);
        } catch (err) {
            console.error('Error:', err);
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

    useEffect(() => {
        fetchContacts();
        fetchTags();
    }, [search, selectedTag]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.phone) {
            toast.error('Phone number is required');
            return;
        }
        
        setSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (editingContact) {
                await api.put(`/contacts/${editingContact._id}`, payload);
                toast.success('Contact updated!');
            } else {
                await api.post('/contacts', payload);
                toast.success('Contact created!');
            }
            
            setShowModal(false);
            setEditingContact(null);
            setFormData({ name: '', phone: '', email: '', tags: '' });
            fetchContacts();
            fetchTags();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save contact');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this contact?')) return;
        
        try {
            await api.delete(`/contacts/${id}`);
            toast.success('Contact deleted');
            fetchContacts();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name || '',
            phone: contact.phone || '',
            email: contact.email || '',
            tags: (contact.tags || []).join(', ')
        });
        setShowModal(true);
    };

    // CSV File Handler
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        setCsvFile(file);
        parseCSV(file);
    };

    // Parse CSV File
    const parseCSV = (file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    toast.error('CSV file must have headers and at least one data row');
                    return;
                }

                // Parse headers
                const headers = parseCSVLine(lines[0]);
                setCsvHeaders(headers);

                // Auto-detect column mapping
                const autoMapping = {
                    phone: '',
                    name: '',
                    email: '',
                    tags: ''
                };

                headers.forEach((header, index) => {
                    const h = header.toLowerCase().trim();
                    if (h.includes('phone') || h.includes('mobile') || h.includes('number') || h.includes('whatsapp')) {
                        autoMapping.phone = index.toString();
                    } else if (h.includes('name') || h.includes('full name') || h.includes('contact')) {
                        autoMapping.name = index.toString();
                    } else if (h.includes('email') || h.includes('mail')) {
                        autoMapping.email = index.toString();
                    } else if (h.includes('tag') || h.includes('label') || h.includes('group')) {
                        autoMapping.tags = index.toString();
                    }
                });

                setColumnMapping(autoMapping);

                // Parse data rows (preview first 10)
                const dataRows = lines.slice(1, 11).map(line => parseCSVLine(line));
                setCsvPreview(dataRows);

                setImportStep(2);
                toast.success(`Found ${lines.length - 1} contacts in CSV`);
            } catch (err) {
                console.error('CSV Parse Error:', err);
                toast.error('Failed to parse CSV file');
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read file');
        };

        reader.readAsText(file);
    };

    // Parse CSV Line (handles quoted values)
    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        return result;
    };

    // Process and Import CSV
    const handleCSVImport = async () => {
        if (!columnMapping.phone) {
            toast.error('Please map the Phone column');
            return;
        }

        setSaving(true);
        try {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n').filter(line => line.trim());
                    
                    const contacts = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const values = parseCSVLine(lines[i]);
                        
                        const phone = columnMapping.phone !== '' ? values[parseInt(columnMapping.phone)] : '';
                        const name = columnMapping.name !== '' ? values[parseInt(columnMapping.name)] : '';
                        const email = columnMapping.email !== '' ? values[parseInt(columnMapping.email)] : '';
                        const tags = columnMapping.tags !== '' ? values[parseInt(columnMapping.tags)] : '';

                        if (phone && phone.trim()) {
                            contacts.push({
                                phone: phone.replace(/[\s\-\(\)]/g, '').trim(),
                                name: name?.trim() || '',
                                email: email?.trim() || '',
                                tags: tags ? tags.split(';').map(t => t.trim()).filter(Boolean) : []
                            });
                        }
                    }

                    if (contacts.length === 0) {
                        toast.error('No valid contacts found');
                        setSaving(false);
                        return;
                    }

                    // Send to API
                    const response = await api.post('/contacts/import', { contacts });
                    
                    toast.success(`Successfully imported ${response.data.data.imported} contacts!`);
                    
                    if (response.data.data.errors?.length > 0) {
                        toast.error(`${response.data.data.errors.length} contacts failed to import`);
                    }

                    // Reset
                    setShowImportModal(false);
                    resetImportState();
                    fetchContacts();
                    fetchTags();
                } catch (err) {
                    console.error('Import error:', err);
                    toast.error(err.response?.data?.error || 'Import failed');
                }
                setSaving(false);
            };

            reader.readAsText(csvFile);
        } catch (err) {
            toast.error('Import failed');
            setSaving(false);
        }
    };

    // Reset Import State
    const resetImportState = () => {
        setCsvFile(null);
        setCsvPreview([]);
        setCsvHeaders([]);
        setColumnMapping({ phone: '', name: '', email: '', tags: '' });
        setImportStep(1);
        setImportData('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Manual Text Import
    const handleManualImport = async () => {
        try {
            const lines = importData.trim().split('\n');
            const contacts = lines.map(line => {
                const [phone, name, email] = line.split(',').map(s => s?.trim());
                return { phone, name, email };
            }).filter(c => c.phone);
            
            if (contacts.length === 0) {
                toast.error('No valid contacts found');
                return;
            }
            
            setSaving(true);
            const response = await api.post('/contacts/import', { contacts });
            toast.success(`Imported ${response.data.data.imported} contacts!`);
            setShowImportModal(false);
            resetImportState();
            fetchContacts();
        } catch (err) {
            toast.error('Import failed');
        } finally {
            setSaving(false);
        }
    };

    // Export to CSV
    const handleExport = async () => {
        try {
            const response = await api.get('/contacts/export?format=json');
            const contactsData = response.data.data;
            
            // Convert to CSV
            const headers = ['Name', 'Phone', 'Email', 'Tags'];
            const csvContent = [
                headers.join(','),
                ...contactsData.map(c => [
                    `"${c.name || ''}"`,
                    `"${c.phone || ''}"`,
                    `"${c.email || ''}"`,
                    `"${(c.tags || []).join(';')}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
            
            toast.success('Contacts exported to CSV!');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    // Download Sample CSV
    const downloadSampleCSV = () => {
        const sampleCSV = `Name,Phone,Email,Tags
John Doe,919876543210,john@example.com,customer;vip
Jane Smith,918765432109,jane@example.com,customer
Bob Wilson,917654321098,bob@example.com,lead`;
        
        const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'contacts_sample.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Sample CSV downloaded!');
    };

    // Get mapped preview data
    const getMappedPreview = () => {
        return csvPreview.map(row => ({
            phone: columnMapping.phone !== '' ? row[parseInt(columnMapping.phone)] : '-',
            name: columnMapping.name !== '' ? row[parseInt(columnMapping.name)] : '-',
            email: columnMapping.email !== '' ? row[parseInt(columnMapping.email)] : '-',
            tags: columnMapping.tags !== '' ? row[parseInt(columnMapping.tags)] : '-'
        }));
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Contacts</h1>
                    <p className="text-gray-600">{contacts.length} contacts found</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setShowImportModal(true);
                            resetImportState();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        📥 Import CSV
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        📤 Export CSV
                    </button>
                    <button
                        onClick={() => {
                            setEditingContact(null);
                            setFormData({ name: '', phone: '', email: '', tags: '' });
                            setShowModal(true);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                    >
                        ➕ Add Contact
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
                {allTags.length > 0 && (
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
                )}
            </div>

            {/* Tags Quick Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                                selectedTag === tag
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading contacts...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No contacts found</h3>
                        <p className="text-gray-500 mb-4">Add your first contact or import from CSV</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                            >
                                Add Contact
                            </button>
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="border border-green-500 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition"
                            >
                                Import CSV
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Messages</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {contacts.map((contact) => (
                                    <tr key={contact._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {(contact.name || contact.phone)?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{contact.name || '-'}</p>
                                                    {contact.profileName && (
                                                        <p className="text-xs text-gray-500">~{contact.profileName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm">{contact.phone}</td>
                                        <td className="px-6 py-4 text-sm">{contact.email || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {contact.tags?.map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {contact.stats?.totalMessages || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(contact)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(contact._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">
                                {editingContact ? 'Edit Contact' : 'Add Contact'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingContact(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                    placeholder="919876543210"
                                    required
                                    disabled={!!editingContact}
                                />
                                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 91 for India)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                    placeholder="customer, vip (comma separated)"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingContact(null);
                                    }}
                                    className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
                                >
                                    {saving ? 'Saving...' : 'Save Contact'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl my-8">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold">Import Contacts from CSV</h2>
                                <p className="text-gray-500 text-sm">Step {importStep} of 3</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowImportModal(false);
                                    resetImportState();
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    importStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    1
                                </div>
                                <span className="ml-2 text-sm font-medium">Upload</span>
                            </div>
                            <div className={`w-16 h-1 mx-2 ${importStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    importStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    2
                                </div>
                                <span className="ml-2 text-sm font-medium">Map Columns</span>
                            </div>
                            <div className={`w-16 h-1 mx-2 ${importStep >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    importStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    3
                                </div>
                                <span className="ml-2 text-sm font-medium">Preview & Import</span>
                            </div>
                        </div>

                        {/* Step 1: Upload */}
                        {importStep === 1 && (
                            <div className="space-y-6">
                                {/* Upload Area */}
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            setCsvFile(file);
                                            parseCSV(file);
                                        }
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div className="text-5xl mb-4">📄</div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {csvFile ? csvFile.name : 'Drop your CSV file here'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        or click to browse from your computer
                                    </p>
                                    <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                                        Select CSV File
                                    </button>
                                </div>

                                {/* Sample CSV Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">📋 CSV Format Guide</h4>
                                    <p className="text-sm text-blue-700 mb-3">
                                        Your CSV should have columns for Phone, Name, Email (optional), and Tags (optional).
                                    </p>
                                    <div className="bg-white rounded-lg p-3 font-mono text-sm overflow-x-auto">
                                        <div className="text-gray-500">Name,Phone,Email,Tags</div>
                                        <div>John Doe,919876543210,john@example.com,customer;vip</div>
                                        <div>Jane Smith,918765432109,jane@example.com,lead</div>
                                    </div>
                                    <button
                                        onClick={downloadSampleCSV}
                                        className="mt-3 text-blue-600 hover:underline text-sm flex items-center gap-1"
                                    >
                                        ⬇️ Download Sample CSV
                                    </button>
                                </div>

                                {/* Or Manual Import */}
                                <div className="border-t pt-6">
                                    <h4 className="font-semibold mb-3">Or paste contacts manually</h4>
                                    <textarea
                                        value={importData}
                                        onChange={(e) => setImportData(e.target.value)}
                                        placeholder="919876543210, John Doe, john@example.com
918765432109, Jane Smith, jane@example.com"
                                        rows={4}
                                        className="w-full border rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Format: phone, name, email (one per line)</p>
                                    
                                    {importData.trim() && (
                                        <button
                                            onClick={handleManualImport}
                                            disabled={saving}
                                            className="mt-3 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                                        >
                                            {saving ? 'Importing...' : 'Import Manually'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Map Columns */}
                        {importStep === 2 && (
                            <div className="space-y-6">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>📌 Map your CSV columns</strong> to the correct contact fields. 
                                        Phone is required, others are optional.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Phone Mapping */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={columnMapping.phone}
                                            onChange={(e) => setColumnMapping({...columnMapping, phone: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">-- Select Column --</option>
                                            {csvHeaders.map((header, i) => (
                                                <option key={i} value={i}>{header}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Name Mapping */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name
                                        </label>
                                        <select
                                            value={columnMapping.name}
                                            onChange={(e) => setColumnMapping({...columnMapping, name: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">-- Select Column (optional) --</option>
                                            {csvHeaders.map((header, i) => (
                                                <option key={i} value={i}>{header}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Email Mapping */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <select
                                            value={columnMapping.email}
                                            onChange={(e) => setColumnMapping({...columnMapping, email: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">-- Select Column (optional) --</option>
                                            {csvHeaders.map((header, i) => (
                                                <option key={i} value={i}>{header}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tags Mapping */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tags
                                        </label>
                                        <select
                                            value={columnMapping.tags}
                                            onChange={(e) => setColumnMapping({...columnMapping, tags: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">-- Select Column (optional) --</option>
                                            {csvHeaders.map((header, i) => (
                                                <option key={i} value={i}>{header}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Use semicolon (;) to separate multiple tags</p>
                                    </div>
                                </div>

                                {/* Raw Data Preview */}
                                <div>
                                    <h4 className="font-semibold mb-2">CSV Headers Detected:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {csvHeaders.map((header, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                                {i}: {header}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setImportStep(1);
                                            setCsvFile(null);
                                            setCsvPreview([]);
                                            setCsvHeaders([]);
                                        }}
                                        className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={() => setImportStep(3)}
                                        disabled={!columnMapping.phone}
                                        className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium"
                                    >
                                        Preview →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Preview & Import */}
                        {importStep === 3 && (
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-sm text-green-800">
                                        <strong>✅ Preview your data</strong> before importing. 
                                        Showing first {csvPreview.length} rows.
                                    </p>
                                </div>

                                {/* Preview Table */}
                                <div className="overflow-x-auto border rounded-xl">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {getMappedPreview().map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-mono">
                                                        {row.phone !== '-' ? (
                                                            <span className="text-green-600">{row.phone}</span>
                                                        ) : (
                                                            <span className="text-red-500">Missing</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{row.name}</td>
                                                    <td className="px-4 py-3 text-sm">{row.email}</td>
                                                    <td className="px-4 py-3 text-sm">{row.tags}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {csvPreview.length === 10 && (
                                    <p className="text-sm text-gray-500 text-center">
                                        ... and more rows
                                    </p>
                                )}

                                {/* Import Summary */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold mb-2">Import Summary</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>📄 File: {csvFile?.name}</li>
                                        <li>📊 Total rows: Will be processed from CSV</li>
                                        <li>✅ Phone column: {csvHeaders[parseInt(columnMapping.phone)] || 'Not set'}</li>
                                        <li>👤 Name column: {columnMapping.name ? csvHeaders[parseInt(columnMapping.name)] : 'Not set'}</li>
                                        <li>📧 Email column: {columnMapping.email ? csvHeaders[parseInt(columnMapping.email)] : 'Not set'}</li>
                                        <li>🏷️ Tags column: {columnMapping.tags ? csvHeaders[parseInt(columnMapping.tags)] : 'Not set'}</li>
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setImportStep(2)}
                                        className="flex-1 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleCSVImport}
                                        disabled={saving}
                                        className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                </svg>
                                                Importing...
                                            </>
                                        ) : (
                                            <>📥 Import Contacts</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}