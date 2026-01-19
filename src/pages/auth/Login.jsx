// src/pages/auth/Login.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🔐 Login form submitted');
        setLoading(true);

        try {
            // Call login and await result
            const result = await login(email, password);
            console.log('Login result:', result);
            
            if (result && result.success) {
                console.log('✅ Login successful - navigating');
                toast.success('Welcome back!');
                
                // Small delay to ensure state updates
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 100);
            } else {
                console.log('❌ Login failed:', result?.message);
                toast.error(result?.message || 'Login failed');
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            toast.error('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                        disabled={loading}
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                        disabled={loading}
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="mt-4 text-center">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600">Sign up</Link>
            </p>
        </div>
    );
}