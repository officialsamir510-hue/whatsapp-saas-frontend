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
import ApiDocs from './pages/ApiDocs';
import Users from './pages/Users';
import SuperAdmin from './pages/SuperAdmin';

function App() {
    const { isAuthenticated, user, isLoading, loadUser } = useAuthStore();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        console.log('🚀 App mounting - loading user...');
        
        const init = async () => {
            await loadUser();
            setInitialized(true);
            console.log('✅ App initialized');
        };
        
        init();
    }, []);  // Only run once on mount

    // Show loading while initializing
    if (!initialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    console.log('🎯 Rendering App - isAuthenticated:', isAuthenticated, 'isSuperAdmin:', user?.isSuperAdmin);

    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            
            <Routes>
                {/* Public Routes */}
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

                {/* Protected Routes */}
                <Route 
                    element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/conversations" element={<Conversations />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/broadcast" element={<Broadcast />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/api-docs" element={<ApiDocs />} />
                    <Route path="/users" element={<Users />} />
                    <Route 
                        path="/super-admin" 
                        element={user?.isSuperAdmin ? <SuperAdmin /> : <Navigate to="/dashboard" replace />}
                    />
                </Route>

                {/* Catch All */}
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;