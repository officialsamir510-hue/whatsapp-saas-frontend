import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '' 
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('🔐 Submitting login form...');

        const result = await login(formData.email, formData.password);

        console.log('Login result:', result);

        if (result.success) {
            toast.success('Login successful!');
            
            // Small delay before navigation
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 100);
        } else {
            toast.error(result.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-600 text-center mb-8">
                    Login
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({
                                ...formData, 
                                email: e.target.value
                            })}
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                            required
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({
                                ...formData, 
                                password: e.target.value
                            })}
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                            required
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <p className="text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}