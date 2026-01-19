import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                        <span className="text-4xl">💬</span>
                        <span>WhatsApp SaaS</span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Powerful WhatsApp Marketing Platform
                    </p>
                </div>

                {/* Auth Form Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <Outlet />
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © 2024 WhatsApp SaaS. All rights reserved.
                </p>
            </div>
        </div>
    );
}