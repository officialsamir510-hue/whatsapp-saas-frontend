import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Conversations() {
    const { tenant } = useAuthStore();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [newNumber, setNewNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch contacts
    const fetchContacts = async () => {
        try {
            const response = await api.get(`/contacts?search=${searchQuery}&limit=100`);
            setContacts(response.data.data.contacts || []);
        } catch (err) {
            console.error('Error fetching contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [searchQuery]);

    // Fetch messages
    const fetchMessages = async () => {
        if (!selectedContact) return;
        try {
            const response = await api.get(`/messages/conversation/${selectedContact.waId}`);
            setMessages(response.data.data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    useEffect(() => {
        if (selectedContact) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedContact]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        const to = selectedContact?.waId || newNumber.replace(/[\s+\-]/g, '');
        if (!to) {
            toast.error('Please enter a phone number');
            return;
        }

        setSending(true);
        try {
            await api.post('/messages/send/text', { to, message: message.trim() });
            toast.success('Message sent!');
            setMessage('');
            
            if (showNewChat) {
                setShowNewChat(false);
                setNewNumber('');
                await fetchContacts();
            }
            
            if (selectedContact) {
                await fetchMessages();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'sent': return '✓';
            case 'delivered': return '✓✓';
            case 'read': return <span className="text-blue-400">✓✓</span>;
            case 'failed': return <span className="text-red-400">✗</span>;
            default: return '○';
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = formatDate(msg.createdAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Contacts Sidebar */}
            <div className="w-80 border-r bg-white flex flex-col">
                {/* Search & New Chat */}
                <div className="p-4 border-b space-y-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setShowNewChat(true);
                            setSelectedContact(null);
                        }}
                        className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition font-medium"
                    >
                        ✚ New Chat
                    </button>
                </div>
                
                {/* Contact List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading contacts...</p>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <div className="text-4xl mb-2">👤</div>
                            <p>No contacts yet</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="mt-2 text-green-600 hover:underline"
                            >
                                Start a new chat
                            </button>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div
                                key={contact._id}
                                onClick={() => {
                                    setSelectedContact(contact);
                                    setShowNewChat(false);
                                }}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                                    selectedContact?._id === contact._id 
                                        ? 'bg-green-50 border-l-4 border-l-green-500' 
                                        : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                                        {(contact.name || contact.phone)?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {contact.name || contact.phone}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {contact.phone}
                                        </p>
                                    </div>
                                    {contact.stats?.lastMessageAt && (
                                        <span className="text-xs text-gray-400">
                                            {formatTime(contact.stats.lastMessageAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {showNewChat ? (
                    // New Chat Form
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">💬</span>
                                </div>
                                <h3 className="font-bold text-xl">New Message</h3>
                                <p className="text-gray-500 text-sm">Enter the WhatsApp number to message</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={newNumber}
                                        onChange={(e) => setNewNumber(e.target.value)}
                                        placeholder="919876543210 (with country code)"
                                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        rows={4}
                                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowNewChat(false)}
                                        className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={!newNumber || !message.trim() || sending}
                                        className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                                    >
                                        {sending ? '⏳ Sending...' : '📤 Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedContact ? (
                    // Chat View
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {(selectedContact.name || selectedContact.phone)?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">{selectedContact.name || selectedContact.phone}</p>
                                    <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    {messages.length} messages
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div 
                            className="flex-1 overflow-y-auto p-4"
                            style={{ 
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
                            }}
                        >
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <div className="text-6xl mb-4">💬</div>
                                        <p className="text-lg font-medium">No messages yet</p>
                                        <p className="text-sm">Start the conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                Object.entries(groupedMessages).map(([date, msgs]) => (
                                    <div key={date}>
                                        {/* Date Separator */}
                                        <div className="flex items-center justify-center my-4">
                                            <span className="bg-white px-4 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                                                {date}
                                            </span>
                                        </div>
                                        
                                        {/* Messages */}
                                        {msgs.map((msg) => (
                                            <div
                                                key={msg._id}
                                                className={`flex mb-3 ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                                                    msg.direction === 'outbound'
                                                        ? 'bg-green-500 text-white rounded-br-md'
                                                        : 'bg-white text-gray-900 rounded-bl-md'
                                                }`}>
                                                    {/* Message Content */}
                                                    <p className="break-words">{msg.content?.text || `[${msg.type}]`}</p>
                                                    
                                                    {/* Time & Status */}
                                                    <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                                                        msg.direction === 'outbound' ? 'text-green-100' : 'text-gray-400'
                                                    }`}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {msg.direction === 'outbound' && (
                                                            <span>{getStatusIcon(msg.status)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSend} className="bg-white border-t p-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border rounded-full px-5 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || sending}
                                    className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
                                >
                                    {sending ? (
                                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    // No chat selected
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <div className="text-8xl mb-6">💬</div>
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">WhatsApp Messages</h2>
                            <p className="text-gray-500 mb-6">Select a contact or start a new chat</p>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
                            >
                                Start New Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}