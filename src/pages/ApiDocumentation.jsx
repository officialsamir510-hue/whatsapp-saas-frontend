import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ApiDocumentation() {
    const [copiedCode, setCopiedCode] = useState(null);

    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://your-api.com';

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
                <p className="text-lg text-gray-600">
                    Integrate WhatsApp messaging into your applications
                </p>
            </div>

            {/* Quick Start */}
            <Section title="🚀 Quick Start" id="quick-start">
                <div className="prose max-w-none">
                    <p className="text-gray-700 mb-4">
                        Get started with our WhatsApp API in 3 simple steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Create an API key from your <a href="/api-keys" className="text-blue-600 hover:underline">dashboard</a></li>
                        <li>Connect your WhatsApp Business account</li>
                        <li>Start sending messages using our REST API</li>
                    </ol>
                </div>
            </Section>

            {/* Authentication */}
            <Section title="🔐 Authentication" id="authentication">
                <p className="text-gray-700 mb-4">
                    All API requests must include your API key in the request headers:
                </p>
                
                <CodeBlock
                    title="Authentication Header"
                    language="bash"
                    code={`curl -X POST ${apiBaseUrl}/api/v1/messages/send \\
  -H "X-API-Key: wsp_your_api_key_here" \\
  -H "Content-Type: application/json"`}
                    onCopy={() => copyCode(`X-API-Key: wsp_your_api_key_here`, 'auth')}
                    copied={copiedCode === 'auth'}
                />

                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                        <strong>⚠️ Important:</strong> Keep your API key secure and never share it publicly.
                    </p>
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
            </Section>

            {/* Send Message */}
            <Section title="📤 Send Message" id="send-message">
                <div className="mb-4">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        POST
                    </span>
                    <code className="ml-3 text-gray-700 font-mono">/messages/send</code>
                </div>

                <p className="text-gray-700 mb-4">Send a WhatsApp message to a recipient.</p>

                <h4 className="font-semibold text-gray-900 mb-3">Request Body</h4>
                
                <CodeBlock
                    title="Send Text Message"
                    language="json"
                    code={`{
  "to": "919876543210",
  "type": "text",
  "message": "Hello from WhatsApp API!"
}`}
                    onCopy={() => copyCode(`{
  "to": "919876543210",
  "type": "text",
  "message": "Hello from WhatsApp API!"
}`, 'send-text')}
                    copied={copiedCode === 'send-text'}
                />

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">Send Image</h4>
                
                <CodeBlock
                    title="Send Image Message"
                    language="json"
                    code={`{
  "to": "919876543210",
  "type": "image",
  "media": {
    "url": "https://example.com/image.jpg",
    "caption": "Check out this image!"
  }
}`}
                    onCopy={() => copyCode(`{
  "to": "919876543210",
  "type": "image",
  "media": {
    "url": "https://example.com/image.jpg",
    "caption": "Check out this image!"
  }
}`, 'send-image')}
                    copied={copiedCode === 'send-image'}
                />

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">Response</h4>
                
                <CodeBlock
                    language="json"
                    code={`{
  "success": true,
  "data": {
    "id": "msg_123456",
    "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwFQIAERgSO",
    "status": "sent",
    "to": "919876543210",
    "type": "text",
    "sentAt": "2024-01-15T10:30:00.000Z"
  }
}`}
                />

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">Parameters</h4>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Parameter</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Required</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-gray-900">to</td>
                                <td className="px-4 py-3 text-sm text-gray-700">string</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold">Yes</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Recipient's phone number (10-15 digits, no + or spaces)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-gray-900">type</td>
                                <td className="px-4 py-3 text-sm text-gray-700">string</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold">Yes</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Message type: text, image, video, document, audio, template</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-gray-900">message</td>
                                <td className="px-4 py-3 text-sm text-gray-700">string</td>
                                <td className="px-4 py-3 text-sm text-gray-600">For text</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Message text (required for type: text)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-gray-900">media</td>
                                <td className="px-4 py-3 text-sm text-gray-700">object</td>
                                <td className="px-4 py-3 text-sm text-gray-600">For media</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Media object with url, caption, filename</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Get Message Status */}
            <Section title="📊 Get Message Status" id="message-status">
                <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        GET
                    </span>
                    <code className="ml-3 text-gray-700 font-mono">/messages/:messageId/status</code>
                </div>

                <p className="text-gray-700 mb-4">Get the delivery status of a sent message.</p>

                <CodeBlock
                    title="Example Request"
                    language="bash"
                    code={`curl -X GET ${apiBaseUrl}/api/v1/messages/msg_123456/status \\
  -H "X-API-Key: wsp_your_api_key_here"`}
                    onCopy={() => copyCode(`curl -X GET ${apiBaseUrl}/api/v1/messages/msg_123456/status \\
  -H "X-API-Key: wsp_your_api_key_here"`, 'get-status')}
                    copied={copiedCode === 'get-status'}
                />

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">Response</h4>
                
                <CodeBlock
                    language="json"
                    code={`{
  "success": true,
  "data": {
    "id": "msg_123456",
    "messageId": "wamid.xxx",
    "status": "delivered",
    "to": "919876543210",
    "type": "text",
    "sentAt": "2024-01-15T10:30:00.000Z",
    "deliveredAt": "2024-01-15T10:30:15.000Z",
    "readAt": null
  }
}`}
                />

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">Status Values</h4>
                
                <div className="space-y-2">
                    <StatusBadge status="queued" description="Message is in queue" />
                    <StatusBadge status="sent" description="Message sent to WhatsApp" />
                    <StatusBadge status="delivered" description="Message delivered to recipient" />
                    <StatusBadge status="read" description="Message read by recipient" />
                    <StatusBadge status="failed" description="Message failed to send" />
                </div>
            </Section>

            {/* Error Codes */}
            <Section title="⚠️ Error Codes" id="errors">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">400</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Bad Request - Invalid parameters</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">401</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Unauthorized - Invalid API key</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">403</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Forbidden - Account suspended or inactive</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">404</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Not Found - Resource not found</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">429</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Too Many Requests - Rate limit exceeded</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 text-sm font-mono text-red-600">500</td>
                                <td className="px-4 py-3 text-sm text-gray-700">Internal Server Error</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* Rate Limits */}
            <Section title="⏱️ Rate Limits" id="rate-limits">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-sm text-blue-800">
                        API rate limits vary by plan. Check your current limits in the dashboard.
                    </p>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Free Plan</h4>
                        <p className="text-2xl font-bold text-gray-900">10</p>
                        <p className="text-sm text-gray-600">requests per minute</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Professional Plan</h4>
                        <p className="text-2xl font-bold text-gray-900">100</p>
                        <p className="text-sm text-gray-600">requests per minute</p>
                    </div>
                </div>
            </Section>

            {/* Code Examples */}
            <Section title="💻 Code Examples" id="examples">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">JavaScript (Node.js)</h4>
                        <CodeBlock
                            language="javascript"
                            code={`const axios = require('axios');

const API_KEY = 'wsp_your_api_key_here';
const API_URL = '${apiBaseUrl}/api/v1';

async function sendMessage() {
  try {
    const response = await axios.post(
      \`\${API_URL}/messages/send\`,
      {
        to: '919876543210',
        type: 'text',
        message: 'Hello from Node.js!'
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendMessage();`}
                            onCopy={() => copyCode(`const axios = require('axios');

const API_KEY = 'wsp_your_api_key_here';
const API_URL = '${apiBaseUrl}/api/v1';

async function sendMessage() {
  try {
    const response = await axios.post(
      \`\${API_URL}/messages/send\`,
      {
        to: '919876543210',
        type: 'text',
        message: 'Hello from Node.js!'
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendMessage();`, 'example-node')}
                            copied={copiedCode === 'example-node'}
                        />
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Python</h4>
                        <CodeBlock
                            language="python"
                            code={`import requests

API_KEY = 'wsp_your_api_key_here'
API_URL = '${apiBaseUrl}/api/v1'

def send_message():
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'to': '919876543210',
        'type': 'text',
        'message': 'Hello from Python!'
    }
    
    response = requests.post(
        f'{API_URL}/messages/send',
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        print('Message sent:', response.json())
    else:
        print('Error:', response.json())

send_message()`}
                            onCopy={() => copyCode(`import requests

API_KEY = 'wsp_your_api_key_here'
API_URL = '${apiBaseUrl}/api/v1'

def send_message():
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'to': '919876543210',
        'type': 'text',
        'message': 'Hello from Python!'
    }
    
    response = requests.post(
        f'{API_URL}/messages/send',
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        print('Message sent:', response.json())
    else:
        print('Error:', response.json())

send_message()`, 'example-python')}
                            copied={copiedCode === 'example-python'}
                        />
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">PHP</h4>
                        <CodeBlock
                            language="php"
                            code={`<?php

$apiKey = 'wsp_your_api_key_here';
$apiUrl = '${apiBaseUrl}/api/v1';

function sendMessage($apiKey, $apiUrl) {
    $data = [
        'to' => '919876543210',
        'type' => 'text',
        'message' => 'Hello from PHP!'
    ];
    
    $ch = curl_init("$apiUrl/messages/send");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        echo "Message sent: " . $response;
    } else {
        echo "Error: " . $response;
    }
}

sendMessage($apiKey, $apiUrl);`}
                            onCopy={() => copyCode(`<?php

$apiKey = 'wsp_your_api_key_here';
$apiUrl = '${apiBaseUrl}/api/v1';

function sendMessage($apiKey, $apiUrl) {
    $data = [
        'to' => '919876543210',
        'type' => 'text',
        'message' => 'Hello from PHP!'
    ];
    
    $ch = curl_init("$apiUrl/messages/send");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        echo "Message sent: " . $response;
    } else {
        echo "Error: " . $response;
    }
}

sendMessage($apiKey, $apiUrl);`, 'example-php')}
                            copied={copiedCode === 'example-php'}
                        />
                    </div>
                </div>
            </Section>

            {/* Support */}
            <Section title="💬 Support" id="support">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <h3 className="font-bold text-xl mb-2">Need Help?</h3>
                    <p className="text-green-100 mb-4">
                        Our support team is here to help you integrate successfully
                    </p>
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
                            Contact Us
                        </a>
                    </div>
                </div>
            </Section>
        </div>
    );
}

// ==================== COMPONENTS ====================

function Section({ title, id, children }) {
    return (
        <section id={id} className="mb-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                {title}
            </h2>
            <div className="mt-6">
                {children}
            </div>
        </section>
    );
}

function CodeBlock({ title, language, code, onCopy, copied }) {
    return (
        <div className="mb-4">
            {title && (
                <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded-t-lg">
                    <span className="text-sm font-medium">{title}</span>
                    {language && (
                        <span className="text-xs text-gray-400 uppercase">{language}</span>
                    )}
                </div>
            )}
            <div className="relative">
                <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${title ? '' : 'rounded-t-lg'} rounded-b-lg`}>
                    <code className="text-sm font-mono">{code}</code>
                </pre>
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 transition"
                    >
                        {copied ? (
                            <>
                                <FaCheck size={14} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <FaCopy size={14} />
                                Copy
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status, description }) {
    const colors = {
        queued: 'bg-gray-100 text-gray-700',
        sent: 'bg-blue-100 text-blue-700',
        delivered: 'bg-green-100 text-green-700',
        read: 'bg-purple-100 text-purple-700',
        failed: 'bg-red-100 text-red-700'
    };

    return (
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
                {status}
            </span>
            <span className="text-gray-600 text-sm">{description}</span>
        </div>
    );
}