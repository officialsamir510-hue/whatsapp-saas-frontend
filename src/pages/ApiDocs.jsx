import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ApiDocs() {
    const { tenant } = useAuthStore();
    const [copied, setCopied] = useState('');
    const baseUrl = window.location.origin.replace('3000', '8000');

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopied(id);
        toast.success('Copied!');
        setTimeout(() => setCopied(''), 2000);
    };

    const endpoints = [
        {
            id: 'send-text',
            method: 'POST',
            path: '/api/messages/send/text',
            description: 'Send a text message',
            body: {
                to: '919876543210',
                message: 'Hello from API!'
            }
        },
        {
            id: 'send-template',
            method: 'POST',
            path: '/api/messages/send/template',
            description: 'Send a template message',
            body: {
                to: '919876543210',
                templateName: 'hello_world',
                languageCode: 'en',
                components: []
            }
        },
        {
            id: 'send-media',
            method: 'POST',
            path: '/api/messages/send/media',
            description: 'Send image/video/document',
            body: {
                to: '919876543210',
                type: 'image',
                mediaUrl: 'https://example.com/image.jpg',
                caption: 'Check this out!'
            }
        },
        {
            id: 'broadcast',
            method: 'POST',
            path: '/api/messages/broadcast',
            description: 'Send to multiple contacts',
            body: {
                recipients: ['919876543210', '918765432109'],
                message: 'Broadcast message',
                type: 'text'
            }
        },
        {
            id: 'get-messages',
            method: 'GET',
            path: '/api/messages',
            description: 'Get all messages',
            body: null
        },
        {
            id: 'get-contacts',
            method: 'GET',
            path: '/api/contacts',
            description: 'Get all contacts',
            body: null
        },
        {
            id: 'create-contact',
            method: 'POST',
            path: '/api/contacts',
            description: 'Create a new contact',
            body: {
                name: 'John Doe',
                phone: '919876543210',
                email: 'john@example.com',
                tags: ['customer', 'vip']
            }
        }
    ];

    return (
        <div className="p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">API Documentation</h1>
                <p className="text-gray-600">Integrate WhatsApp messaging into your applications</p>
            </div>

            {/* Authentication */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">🔐 Authentication</h2>
                <p className="text-gray-600 mb-4">
                    Include your API key in the request headers:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 relative">
                    <button
                        onClick={() => copyCode(`x-api-key: ${tenant?.apiKey}`, 'auth')}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                        {copied === 'auth' ? <FiCheck /> : <FiCopy />}
                    </button>
                    <code className="text-green-400 text-sm">
                        x-api-key: {tenant?.apiKey}
                    </code>
                </div>
            </div>

            {/* Base URL */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">🌐 Base URL</h2>
                <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-blue-400 text-sm">{baseUrl}/api</code>
                </div>
            </div>

            {/* Endpoints */}
            <div className="space-y-6">
                {endpoints.map((endpoint) => {
                    const curlCommand = endpoint.body
                        ? `curl -X ${endpoint.method} ${baseUrl}${endpoint.path} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${tenant?.apiKey}" \\
  -d '${JSON.stringify(endpoint.body, null, 2)}'`
                        : `curl -X ${endpoint.method} ${baseUrl}${endpoint.path} \\
  -H "x-api-key: ${tenant?.apiKey}"`;

                    return (
                        <div key={endpoint.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {endpoint.method}
                                </span>
                                <code className="text-sm font-mono">{endpoint.path}</code>
                            </div>
                            <p className="text-gray-600 mb-4">{endpoint.description}</p>
                            
                            {endpoint.body && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Request Body:</h4>
                                    <pre className="bg-gray-100 rounded p-3 text-sm overflow-x-auto">
                                        {JSON.stringify(endpoint.body, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="relative">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">cURL Example:</h4>
                                <button
                                    onClick={() => copyCode(curlCommand, endpoint.id)}
                                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
                                >
                                    {copied === endpoint.id ? <FiCheck className="text-green-500" /> : <FiCopy />}
                                </button>
                                <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">
                                    {curlCommand}
                                </pre>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Response Format */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">📦 Response Format</h2>
                <p className="text-gray-600 mb-4">All API responses follow this format:</p>
                <pre className="bg-gray-100 rounded-lg p-4 text-sm">
{`{
  "success": true,
  "data": {
    "messageId": "...",
    "waMessageId": "...",
    "status": "sent"
  }
}`}
                </pre>
            </div>

            {/* Error Codes */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">❌ Error Codes</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2">Code</th>
                            <th className="text-left py-2">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="py-2"><code>400</code></td>
                            <td className="py-2">Bad Request - Invalid parameters</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2"><code>401</code></td>
                            <td className="py-2">Unauthorized - Invalid API key</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2"><code>402</code></td>
                            <td className="py-2">Payment Required - Insufficient credits</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-2"><code>429</code></td>
                            <td className="py-2">Too Many Requests - Rate limited</td>
                        </tr>
                        <tr>
                            <td className="py-2"><code>500</code></td>
                            <td className="py-2">Internal Server Error</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}