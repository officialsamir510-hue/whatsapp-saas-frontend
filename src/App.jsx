import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Conversations from './pages/Conversations';
import Templates from './pages/Templates';
import Broadcast from './pages/Broadcast';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Users from './pages/Users';
import SuperAdmin from './pages/SuperAdmin';

// ==================== NEW IMPORTS ====================
import ApiKeys from './pages/ApiKeys';
import ApiDocumentation from './pages/ApiDocumentation';
import WhatsAppConnect from './pages/WhatsAppConnect';

function App() {
    const { isAuthenticated, user, loadUser } = useAuthStore();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            console.log('🚀 App initializing...');
            
            const token = localStorage.getItem('AUTH_TOKEN');
            console.log('🔑 Token exists:', !!token);
            
            if (token) {
                console.log('📡 Loading user...');
                await loadUser();
            } else {
                console.log('⚠️ No token, skipping loadUser');
            }
            
            setInitialized(true);
            console.log('✅ App initialized');
        };
        
        initializeAuth();
    }, []);

    // Show loading while initializing
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    console.log('🎯 App render - isAuthenticated:', isAuthenticated, 'user:', user?.email);

    return (
        <BrowserRouter>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            
            <Routes>
                {/* ==================== PUBLIC ROUTES ==================== */}
                <Route element={<AuthLayout />}>
                    <Route 
                        path="/login" 
                        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
                    />
                    <Route 
                        path="/register" 
                        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
                    />
                </Route>

                {/* ==================== PROTECTED ROUTES ==================== */}
                <Route 
                    element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
                >
                    {/* Main Dashboard */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Messaging */}
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/broadcast" element={<Broadcast />} />
                    
                    {/* ✅ NEW: WhatsApp & API Routes */}
                    <Route path="/whatsapp-connect" element={<WhatsAppConnect />} />
                    <Route path="/api-keys" element={<ApiKeys />} />
                    <Route path="/api-docs" element={<ApiDocumentation />} />
                    
                    {/* Account & Settings */}
                    <Route path="/users" element={<Users />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* Super Admin Only */}
                    <Route 
                        path="/super-admin" 
                        element={user?.isSuperAdmin ? <SuperAdmin /> : <Navigate to="/dashboard" replace />}
                    />
                </Route>

                {/* ==================== CATCH ALL ==================== */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;