import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/messages', icon: '💬', label: 'Messages' },
        { path: '/contacts', icon: '👥', label: 'Contacts' },
        { path: '/campaigns', icon: '📢', label: 'Campaigns' },
        { path: '/templates', icon: '📝', label: 'Templates' },
        { path: '/settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all flex flex-col`}>
                <div className="p-4 border-b flex items-center justify-between">
                    {sidebarOpen && <h1 className="text-xl font-bold text-green-600">WhatsApp</h1>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                                            isActive ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {sidebarOpen && <p className="font-medium truncate">{user?.name || 'User'}</p>}
                    </div>
                    <button onClick={handleLogout} className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2">
                        <span>🚪</span>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}