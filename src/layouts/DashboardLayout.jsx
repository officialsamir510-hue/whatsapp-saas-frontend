import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function DashboardLayout() {
    const { user, tenant, logout } = useAuthStore();
    const navigate = useNavigate();

    // Debug: Check user data
    useEffect(() => {
        console.log('👤 Current User:', user);
        console.log('🔥 Is Super Admin:', user?.isSuperAdmin);
    }, [user]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
    };

    // ============================================
    // DYNAMIC MENU BASED ON USER TYPE
    // ============================================
    const menuItems = user?.isSuperAdmin ? [
        // 🔥 SUPER ADMIN MENU
        { path: '/super-admin', label: 'Super Admin Panel', icon: '🔥' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/users', label: 'Team', icon: '👨‍💼' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ] : [
        // 👤 NORMAL USER MENU
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/conversations', label: 'Conversations', icon: '💬' },
        { path: '/contacts', label: 'Contacts', icon: '👥' },
        { path: '/templates', label: 'Templates', icon: '📝' },
        { path: '/broadcast', label: 'Broadcast', icon: '📢' },
        { path: '/users', label: 'Team', icon: '👨‍💼' },
        { path: '/api-docs', label: 'API Docs', icon: '📚' },
        { path: '/billing', label: 'Billing', icon: '💳' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg fixed h-full z-10 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">
                        <span>💬</span>
                        <span>WhatsApp SaaS</span>
                    </h1>
                    {user?.isSuperAdmin && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">🔥 SUPER ADMIN MODE</p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                            isActive
                                                ? 'bg-green-50 text-green-600 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Credits Info - Only for normal users */}
                {!user?.isSuperAdmin && (
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-green-50 rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600">Credits</span>
                                <span className="text-sm font-bold text-green-600">
                                    {tenant?.messageCredits?.toLocaleString() || 0}
                                </span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min((tenant?.messageCredits || 0) / 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user?.isSuperAdmin ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                            <span className={`font-bold text-lg ${
                                user?.isSuperAdmin ? 'text-red-600' : 'text-green-600'
                            }`}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || 'email@example.com'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-200"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">
                                {user?.isSuperAdmin 
                                    ? '🔥 System Administrator' 
                                    : (tenant?.company || tenant?.name || 'Your Company')
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                                user?.isSuperAdmin 
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {user?.isSuperAdmin ? 'Super Admin' : (tenant?.plan || 'Free') + ' Plan'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}