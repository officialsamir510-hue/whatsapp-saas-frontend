import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ApiDocumentation() {
    const [copiedCode, setCopiedCode] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://your-api.com';

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📖' },
        { id: 'authentication', label: 'Authentication', icon: '🔐' },
        { id: 'messages', label: 'Messages', icon: '📤' },
        { id: 'templates', label: 'Templates', icon: '📝' },
        { id: 'webhooks', label: 'Webhooks', icon: '🔔' },
        { id: 'examples', label: 'Examples', icon: '💻' },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
                <p className="text-lg text-gray-600">
                    Integrate WhatsApp messaging into your applications
                </p>
                <div className="flex gap-3 mt-4">
                    <a 
                        href="/api-keys" 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Get API Key →
                    </a>
                    <a 
                        href="/whatsapp-connect" 
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        Connect WhatsApp
                    </a>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                            activeTab === tab.id
                                ? 'bg-green-100 text-green-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                
                {/* ==================== OVERVIEW TAB ==================== */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Quick Start */}
                        <Section title="🚀 Quick Start" id="quick-start">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 mb-4">
                                    Get started with our WhatsApp API in 3 simple steps:
                                </p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="text-3xl mb-2">1️⃣</div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Create API Key</h4>
                                        <p className="text-sm text-gray-600">
                                            Generate an API key from your <a href="/api-keys" className="text-green-600 hover:underline">dashboard</a>
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="text-3xl mb-2">2️⃣</div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Connect WhatsApp</h4>
                                        <p className="text-sm text-gray-600">
                                            Link your <a href="/whatsapp-connect" className="text-blue-600 hover:underline">WhatsApp Business</a> account
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                        <div className="text-3xl mb-2">3️⃣</div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Send Messages</h4>
                                        <p className="text-sm text-gray-600">
                                            Start sending messages using our REST API
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Base URL */}
                        <Section title="🌐 Base URL" id="base-url">
                            <CodeBlock
                                title="API Base URL"
                                language="text"
                                code={`${apiBaseUrl}/api/v1`}
                                onCopy={() => copyCode(`${apiBaseUrl}/api/v1`, 'base-url')}
                                copied={copiedCode === 'base-url'}
                            />
                            <div className="mt-4 grid md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Production</h4>
                                    <code className="text-sm text-green-600">{apiBaseUrl}/api/v1</code>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Sandbox (Testing)</h4>
                                    <code className="text-sm text-blue-600">{apiBaseUrl}/api/v1/sandbox</code>
                                </div>
                            </div>
                        </Section>

                        {/* Rate Limits */}
                        <Section title="⏱️ Rate Limits" id="rate-limits">
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
                                <p className="text-sm text-blue-800">
                                    API rate limits vary by plan. Check your current limits in the dashboard.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <PlanCard plan="Free" requests="10" color="gray" />
                                <PlanCard plan="Starter" requests="30" color="blue" />
                                <PlanCard plan="Professional" requests="100" color="purple" />
                                <PlanCard plan="Enterprise" requests="500" color="green" />
                            </div>
                        </Section>

                        {/* Error Codes */}
                        <Section title="⚠️ Error Codes" id="errors">
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <ErrorRow code="200" status="OK" description="Request successful" color="green" />
                                        <ErrorRow code="201" status="Created" description="Resource created successfully" color="green" />
                                        <ErrorRow code="400" status="Bad Request" description="Invalid parameters or missing required fields" color="red" />
                                        <ErrorRow code="401" status="Unauthorized" description="Invalid or missing API key" color="red" />
                                        <ErrorRow code="403" status="Forbidden" description="Account suspended or feature not available" color="red" />
                                        <ErrorRow code="404" status="Not Found" description="Resource not found" color="red" />
                                        <ErrorRow code="429" status="Too Many Requests" description="Rate limit exceeded" color="yellow" />
                                        <ErrorRow code="500" status="Server Error" description="Internal server error" color="red" />
                                    </tbody>
                                </table>
                            </div>
                        </Section>
                    </div>
                )}

                {/* ==================== AUTHENTICATION TAB ==================== */}
                {activeTab === 'authentication' && (
                    <div className="space-y-8">
                        <Section title="🔐 Authentication" id="authentication">
                            <p className="text-gray-700 mb-4">
                                All API requests must include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key</code> header.
                            </p>
                            
                            <CodeBlock
                                title="Authentication Header"
                                language="bash"
                                code={`curl -X POST ${apiBaseUrl}/api/v1/messages/send \\
  -H "X-API-Key: wsp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"to": "919876543210", "message": "Hello!"}'`}
                                onCopy={() => copyCode(`curl -X POST ${apiBaseUrl}/api/v1/messages/send \\
  -H "X-API-Key: wsp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"to": "919876543210", "message": "Hello!"}'`, 'auth-curl')}
                                copied={copiedCode === 'auth-curl'}
                            />

                            <div className="mt-6 grid md:grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">✅ Live Keys</h4>
                                    <p className="text-sm text-green-700 mb-2">Prefix: <code className="bg-green-100 px-2 py-0.5 rounded">wsp_live_</code></p>
                                    <p className="text-sm text-green-600">Use for production. Messages are delivered to real users.</p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2">🧪 Test Keys</h4>
                                    <p className="text-sm text-yellow-700 mb-2">Prefix: <code className="bg-yellow-100 px-2 py-0.5 rounded">wsp_test_</code></p>
                                    <p className="text-sm text-yellow-600">Use for testing. Messages are not actually sent.</p>
                                </div>
                            </div>

                            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                <h4 className="font-semibold text-red-800 mb-2">⚠️ Security Best Practices</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    <li>• Never expose API keys in client-side code</li>
                                    <li>• Don't commit API keys to version control</li>
                                    <li>• Rotate keys periodically</li>
                                    <li>• Use environment variables to store keys</li>
                                </ul>
                            </div>
                        </Section>

                        <Section title="🔄 API Key Management" id="key-management">
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono">POST</span>
                                        <code className="text-gray-700">/api/keys</code>
                                    </div>
                                    <p className="text-gray-600 text-sm">Create a new API key</p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-mono">GET</span>
                                        <code className="text-gray-700">/api/keys</code>
                                    </div>
                                    <p className="text-gray-600 text-sm">List all API keys</p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-mono">DELETE</span>
                                        <code className="text-gray-700">/api/keys/:keyId</code>
                                    </div>
                                    <p className="text-gray-600 text-sm">Delete an API key</p>
                                </div>
                            </div>
                        </Section>
                    </div>
                )}

                {/* ==================== MESSAGES TAB ==================== */}
                {activeTab === 'messages' && (
                    <div className="space-y-8">
                        {/* Send Text Message */}
                        <Section title="📤 Send Text Message" id="send-text">
                            <EndpointHeader method="POST" path="/messages/send" />
                            <p className="text-gray-700 mb-4">Send a text message to a WhatsApp number.</p>

                            <CodeBlock
                                title="Request"
                                language="json"
                                code={`{
  "to": "919876543210",
  "type": "text",
  "message": "Hello from WhatsApp API! 👋"
}`}
                                onCopy={() => copyCode(`{
  "to": "919876543210",
  "type": "text",
  "message": "Hello from WhatsApp API! 👋"
}`, 'send-text')}
                                copied={copiedCode === 'send-text'}
                            />

                            <CodeBlock
                                title="Response"
                                language="json"
                                code={`{
  "success": true,
  "data": {
    "id": "msg_abc123",
    "messageId": "wamid.HBgNOTE5ODc2NTQzMjEw...",
    "status": "sent",
    "to": "919876543210",
    "type": "text",
    "sentAt": "2024-01-15T10:30:00.000Z"
  }
}`}
                            />

                            <ParametersTable parameters={[
                                { name: 'to', type: 'string', required: true, description: 'Recipient phone number with country code (e.g., 919876543210)' },
                                { name: 'type', type: 'string', required: true, description: 'Message type: text, image, video, document, audio' },
                                { name: 'message', type: 'string', required: true, description: 'Message text content (max 4096 characters)' },
                            ]} />
                        </Section>

                        {/* Send Media Message */}
                        <Section title="🖼️ Send Media Message" id="send-media">
                            <EndpointHeader method="POST" path="/messages/send" />
                            <p className="text-gray-700 mb-4">Send an image, video, or document.</p>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <CodeBlock
                                    title="Send Image"
                                    language="json"
                                    code={`{
  "to": "919876543210",
  "type": "image",
  "media": {
    "url": "https://example.com/image.jpg",
    "caption": "Check this out! 📸"
  }
}`}
                                    onCopy={() => copyCode(`{
  "to": "919876543210",
  "type": "image",
  "media": {
    "url": "https://example.com/image.jpg",
    "caption": "Check this out! 📸"
  }
}`, 'send-image')}
                                    copied={copiedCode === 'send-image'}
                                />

                                <CodeBlock
                                    title="Send Document"
                                    language="json"
                                    code={`{
  "to": "919876543210",
  "type": "document",
  "media": {
    "url": "https://example.com/file.pdf",
    "filename": "invoice.pdf",
    "caption": "Your invoice"
  }
}`}
                                    onCopy={() => copyCode(`{
  "to": "919876543210",
  "type": "document",
  "media": {
    "url": "https://example.com/file.pdf",
    "filename": "invoice.pdf",
    "caption": "Your invoice"
  }
}`, 'send-doc')}
                                    copied={copiedCode === 'send-doc'}
                                />
                            </div>

                            <ParametersTable parameters={[
                                { name: 'media.url', type: 'string', required: true, description: 'Public URL of the media file' },
                                { name: 'media.caption', type: 'string', required: false, description: 'Caption for the media (max 1024 characters)' },
                                { name: 'media.filename', type: 'string', required: false, description: 'Filename for documents' },
                            ]} />
                        </Section>

                        {/* Get Message Status */}
                        <Section title="📊 Get Message Status" id="message-status">
                            <EndpointHeader method="GET" path="/messages/:messageId/status" />
                            <p className="text-gray-700 mb-4">Get the delivery status of a sent message.</p>

                            <CodeBlock
                                title="Request"
                                language="bash"
                                code={`curl -X GET ${apiBaseUrl}/api/v1/messages/msg_abc123/status \\
  -H "X-API-Key: wsp_live_your_api_key_here"`}
                                onCopy={() => copyCode(`curl -X GET ${apiBaseUrl}/api/v1/messages/msg_abc123/status \\
  -H "X-API-Key: wsp_live_your_api_key_here"`, 'get-status')}
                                copied={copiedCode === 'get-status'}
                            />

                            <CodeBlock
                                title="Response"
                                language="json"
                                code={`{
  "success": true,
  "data": {
    "id": "msg_abc123",
    "status": "delivered",
    "to": "919876543210",
    "sentAt": "2024-01-15T10:30:00.000Z",
    "deliveredAt": "2024-01-15T10:30:15.000Z",
    "readAt": "2024-01-15T10:31:00.000Z"
  }
}`}
                            />

                            <h4 className="font-semibold text-gray-900 mb-3 mt-6">Message Status Values</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <StatusBadge status="queued" description="In queue" color="gray" />
                                <StatusBadge status="sent" description="Sent to WhatsApp" color="blue" />
                                <StatusBadge status="delivered" description="Delivered" color="green" />
                                <StatusBadge status="read" description="Read by user" color="purple" />
                                <StatusBadge status="failed" description="Failed" color="red" />
                            </div>
                        </Section>

                        {/* Message History */}
                        <Section title="📜 Message History" id="message-history">
                            <EndpointHeader method="GET" path="/messages/history" />
                            <p className="text-gray-700 mb-4">Get paginated list of sent messages.</p>

                            <CodeBlock
                                title="Request"
                                language="bash"
                                code={`curl -X GET "${apiBaseUrl}/api/v1/messages/history?page=1&limit=20&status=delivered" \\
  -H "X-API-Key: wsp_live_your_api_key_here"`}
                                onCopy={() => copyCode(`curl -X GET "${apiBaseUrl}/api/v1/messages/history?page=1&limit=20&status=delivered" \\
  -H "X-API-Key: wsp_live_your_api_key_here"`, 'msg-history')}
                                copied={copiedCode === 'msg-history'}
                            />

                            <ParametersTable parameters={[
                                { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
                                { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 20, max: 100)' },
                                { name: 'status', type: 'string', required: false, description: 'Filter by status: queued, sent, delivered, read, failed' },
                                { name: 'startDate', type: 'string', required: false, description: 'Filter from date (ISO 8601)' },
                                { name: 'endDate', type: 'string', required: false, description: 'Filter to date (ISO 8601)' },
                            ]} />
                        </Section>
                    </div>
                )}

                {/* ==================== TEMPLATES TAB ==================== */}
                {activeTab === 'templates' && (
                    <div className="space-y-8">
                        <Section title="📝 Send Template Message" id="send-template">
                            <EndpointHeader method="POST" path="/messages/template" />
                            <p className="text-gray-700 mb-4">
                                Send a pre-approved WhatsApp template message. Templates must be approved by Meta before use.
                            </p>

                            <CodeBlock
                                title="Request"
                                language="json"
                                code={`{
  "to": "919876543210",
  "template": {
    "name": "order_update",
    "language": "en",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" },
          { "type": "text", "text": "ORD-12345" },
          { "type": "text", "text": "Shipped" }
        ]
      }
    ]
  }
}`}
                                onCopy={() => copyCode(`{
  "to": "919876543210",
  "template": {
    "name": "order_update",
    "language": "en",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" },
          { "type": "text", "text": "ORD-12345" },
          { "type": "text", "text": "Shipped" }
        ]
      }
    ]
  }
}`, 'send-template')}
                                copied={copiedCode === 'send-template'}
                            />

                            <ParametersTable parameters={[
                                { name: 'template.name', type: 'string', required: true, description: 'Template name as registered with Meta' },
                                { name: 'template.language', type: 'string', required: true, description: 'Language code (e.g., en, hi, es)' },
                                { name: 'template.components', type: 'array', required: false, description: 'Template variables and parameters' },
                            ]} />

                            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                <h4 className="font-semibold text-blue-800 mb-2">💡 Template Tips</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Templates must be approved by Meta (24-48 hours)</li>
                                    <li>• Use templates for initiating conversations</li>
                                    <li>• Variables are replaced with your parameter values</li>
                                    <li>• Manage templates in your <a href="/templates" className="underline">Templates page</a></li>
                                </ul>
                            </div>
                        </Section>

                        <Section title="📋 List Templates" id="list-templates">
                            <EndpointHeader method="GET" path="/templates" />
                            <p className="text-gray-700 mb-4">Get all your approved message templates.</p>

                            <CodeBlock
                                title="Response"
                                language="json"
                                code={`{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tpl_abc123",
        "name": "order_update",
        "language": "en",
        "status": "approved",
        "category": "UTILITY",
        "components": [...]
      }
    ],
    "total": 5
  }
}`}
                            />
                        </Section>
                    </div>
                )}

                {/* ==================== WEBHOOKS TAB ==================== */}
                {activeTab === 'webhooks' && (
                    <div className="space-y-8">
                        <Section title="🔔 Webhooks" id="webhooks">
                            <p className="text-gray-700 mb-4">
                                Receive real-time notifications for message status updates and incoming messages.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-900 mb-2">Webhook URL Format</h4>
                                <code className="text-green-600">https://your-server.com/webhook/whatsapp</code>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-3">Webhook Events</h4>
                            <div className="space-y-3">
                                <WebhookEvent 
                                    event="message.sent" 
                                    description="Message was sent to WhatsApp"
                                />
                                <WebhookEvent 
                                    event="message.delivered" 
                                    description="Message was delivered to recipient"
                                />
                                <WebhookEvent 
                                    event="message.read" 
                                    description="Message was read by recipient"
                                />
                                <WebhookEvent 
                                    event="message.failed" 
                                    description="Message failed to send"
                                />
                                <WebhookEvent 
                                    event="message.received" 
                                    description="New incoming message from user"
                                />
                            </div>
                        </Section>

                        <Section title="📥 Webhook Payload" id="webhook-payload">
                            <CodeBlock
                                title="Status Update Payload"
                                language="json"
                                code={`{
  "event": "message.delivered",
  "timestamp": "2024-01-15T10:30:15.000Z",
  "data": {
    "messageId": "msg_abc123",
    "status": "delivered",
    "to": "919876543210",
    "deliveredAt": "2024-01-15T10:30:15.000Z"
  }
}`}
                            />

                            <CodeBlock
                                title="Incoming Message Payload"
                                language="json"
                                code={`{
  "event": "message.received",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "from": "919876543210",
    "type": "text",
    "message": "Hello, I need help!",
    "messageId": "wamid.xxx",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}`}
                            />

                            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Webhook Security</h4>
                                <p className="text-sm text-yellow-700">
                                    We sign all webhook payloads with a secret. Verify the <code className="bg-yellow-100 px-1 rounded">X-Webhook-Signature</code> header to ensure authenticity.
                                </p>
                            </div>
                        </Section>
                    </div>
                )}

                {/* ==================== EXAMPLES TAB ==================== */}
                {activeTab === 'examples' && (
                    <div className="space-y-8">
                        <Section title="💻 Code Examples" id="code-examples">
                            <p className="text-gray-700 mb-6">
                                Copy-paste examples in your favorite programming language.
                            </p>

                            {/* Node.js */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">🟢</span> Node.js (JavaScript)
                                </h4>
                                <CodeBlock
                                    language="javascript"
                                    code={`const axios = require('axios');

const API_KEY = 'wsp_live_your_api_key_here';
const API_URL = '${apiBaseUrl}/api/v1';

async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios.post(
      \`\${API_URL}/messages/send\`,
      {
        to: to,
        type: 'text',
        message: message
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
sendWhatsAppMessage('919876543210', 'Hello from Node.js! 🚀');`}
                                    onCopy={() => copyCode(`const axios = require('axios');

const API_KEY = 'wsp_live_your_api_key_here';
const API_URL = '${apiBaseUrl}/api/v1';

async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios.post(
      \`\${API_URL}/messages/send\`,
      {
        to: to,
        type: 'text',
        message: message
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
sendWhatsAppMessage('919876543210', 'Hello from Node.js! 🚀');`, 'example-node')}
                                    copied={copiedCode === 'example-node'}
                                />
                            </div>

                            {/* Python */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">🐍</span> Python
                                </h4>
                                <CodeBlock
                                    language="python"
                                    code={`import requests

API_KEY = 'wsp_live_your_api_key_here'
API_URL = '${apiBaseUrl}/api/v1'

def send_whatsapp_message(to: str, message: str) -> dict:
    """Send a WhatsApp message"""
    
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'to': to,
        'type': 'text',
        'message': message
    }
    
    response = requests.post(
        f'{API_URL}/messages/send',
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        print('✅ Message sent:', response.json())
        return response.json()
    else:
        print('❌ Error:', response.json())
        response.raise_for_status()

# Usage
send_whatsapp_message('919876543210', 'Hello from Python! 🐍')`}
                                    onCopy={() => copyCode(`import requests

API_KEY = 'wsp_live_your_api_key_here'
API_URL = '${apiBaseUrl}/api/v1'

def send_whatsapp_message(to: str, message: str) -> dict:
    """Send a WhatsApp message"""
    
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'to': to,
        'type': 'text',
        'message': message
    }
    
    response = requests.post(
        f'{API_URL}/messages/send',
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        print('✅ Message sent:', response.json())
        return response.json()
    else:
        print('❌ Error:', response.json())
        response.raise_for_status()

# Usage
send_whatsapp_message('919876543210', 'Hello from Python! 🐍')`, 'example-python')}
                                    copied={copiedCode === 'example-python'}
                                />
                            </div>

                            {/* PHP */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">🐘</span> PHP
                                </h4>
                                <CodeBlock
                                    language="php"
                                    code={`<?php

$apiKey = 'wsp_live_your_api_key_here';
$apiUrl = '${apiBaseUrl}/api/v1';

function sendWhatsAppMessage($to, $message) {
    global $apiKey, $apiUrl;
    
    $data = [
        'to' => $to,
        'type' => 'text',
        'message' => $message
    ];
    
    $ch = curl_init("$apiUrl/messages/send");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'X-API-Key: ' . $apiKey,
            'Content-Type: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode === 200) {
        echo "✅ Message sent: " . print_r($result, true);
        return $result;
    } else {
        echo "❌ Error: " . print_r($result, true);
        return null;
    }
}

// Usage
sendWhatsAppMessage('919876543210', 'Hello from PHP! 🐘');`}
                                    onCopy={() => copyCode(`<?php

$apiKey = 'wsp_live_your_api_key_here';
$apiUrl = '${apiBaseUrl}/api/v1';

function sendWhatsAppMessage($to, $message) {
    global $apiKey, $apiUrl;
    
    $data = [
        'to' => $to,
        'type' => 'text',
        'message' => $message
    ];
    
    $ch = curl_init("$apiUrl/messages/send");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'X-API-Key: ' . $apiKey,
            'Content-Type: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode === 200) {
        echo "✅ Message sent: " . print_r($result, true);
        return $result;
    } else {
        echo "❌ Error: " . print_r($result, true);
        return null;
    }
}

// Usage
sendWhatsAppMessage('919876543210', 'Hello from PHP! 🐘');`, 'example-php')}
                                    copied={copiedCode === 'example-php'}
                                />
                            </div>

                            {/* cURL */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">⚡</span> cURL
                                </h4>
                                <CodeBlock
                                    language="bash"
                                    code={`# Send a text message
curl -X POST ${apiBaseUrl}/api/v1/messages/send \\
  -H "X-API-Key: wsp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "919876543210",
    "type": "text",
    "message": "Hello from cURL! ⚡"
  }'

# Check message status
curl -X GET ${apiBaseUrl}/api/v1/messages/msg_abc123/status \\
  -H "X-API-Key: wsp_live_your_api_key_here"`}
                                    onCopy={() => copyCode(`curl -X POST ${apiBaseUrl}/api/v1/messages/send \\
  -H "X-API-Key: wsp_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "919876543210",
    "type": "text",
    "message": "Hello from cURL! ⚡"
  }'`, 'example-curl')}
                                    copied={copiedCode === 'example-curl'}
                                />
                            </div>
                        </Section>
                    </div>
                )}
            </div>

            {/* Support Section */}
            <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-xl mb-2">Need Help? 💬</h3>
                        <p className="text-green-100">
                            Our support team is here to help you integrate successfully
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="mailto:support@yourapp.com"
                            className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
                        >
                            Email Support
                        </a>
                        <a
                            href="/settings"
                            className="bg-white/20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition backdrop-blur"
                        >
                            View FAQ
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== REUSABLE COMPONENTS ====================

function Section({ title, id, children }) {
    return (
        <section id={id} className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {title}
            </h2>
            <div className="mt-4">
                {children}
            </div>
        </section>
    );
}

function CodeBlock({ title, language, code, onCopy, copied }) {
    return (
        <div className="mb-4 rounded-lg overflow-hidden">
            {title && (
                <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2">
                    <span className="text-sm font-medium">{title}</span>
                    {language && (
                        <span className="text-xs text-gray-400 uppercase">{language}</span>
                    )}
                </div>
            )}
            <div className="relative">
                <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${!title ? 'rounded-t-lg' : ''}`}>
                    <code className="text-sm font-mono whitespace-pre">{code}</code>
                </pre>
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 transition"
                    >
                        {copied ? (
                            <>
                                <FaCheck size={12} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <FaCopy size={12} />
                                Copy
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status, description, color }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        red: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
            <span className="font-mono font-semibold text-sm">{status}</span>
            <p className="text-xs mt-1 opacity-80">{description}</p>
        </div>
    );
}

function EndpointHeader({ method, path }) {
    const methodColors = {
        GET: 'bg-blue-100 text-blue-700',
        POST: 'bg-green-100 text-green-700',
        PUT: 'bg-yellow-100 text-yellow-700',
        DELETE: 'bg-red-100 text-red-700',
    };

    return (
        <div className="mb-4 flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold font-mono ${methodColors[method]}`}>
                {method}
            </span>
            <code className="text-gray-700 font-mono">{path}</code>
        </div>
    );
}

function ParametersTable({ parameters }) {
    return (
        <div className="mt-4 overflow-x-auto">
            <h4 className="font-semibold text-gray-900 mb-3">Parameters</h4>
            <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Required</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {parameters.map((param, index) => (
                        <tr key={index}>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{param.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{param.type}</td>
                            <td className="px-4 py-3 text-sm">
                                {param.required ? (
                                    <span className="text-green-600 font-semibold">Yes</span>
                                ) : (
                                    <span className="text-gray-400">No</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{param.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PlanCard({ plan, requests, color }) {
    const colors = {
        gray: 'border-gray-200 bg-gray-50',
        blue: 'border-blue-200 bg-blue-50',
        purple: 'border-purple-200 bg-purple-50',
        green: 'border-green-200 bg-green-50',
    };

    return (
        <div className={`border rounded-lg p-4 ${colors[color]}`}>
            <h4 className="font-semibold text-gray-900 mb-1">{plan}</h4>
            <p className="text-2xl font-bold text-gray-900">{requests}</p>
            <p className="text-xs text-gray-500">req/minute</p>
        </div>
    );
}

function ErrorRow({ code, status, description, color }) {
    const colors = {
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
    };

    return (
        <tr>
            <td className={`px-4 py-3 text-sm font-mono font-semibold ${colors[color]}`}>{code}</td>
            <td className="px-4 py-3 text-sm font-medium text-gray-900">{status}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{description}</td>
        </tr>
    );
}

function WebhookEvent({ event, description }) {
    return (
        <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
            <code className="bg-purple-100 text-purple-700 px-3 py-1 rounded font-mono text-sm">
                {event}
            </code>
            <span className="text-gray-600 text-sm">{description}</span>
        </div>
    );
}