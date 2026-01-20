import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('📝 Submitting registration...');

        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.company
        );

        console.log('Register result:', result);

        if (result.success) {
            toast.success('Registration successful!');
            
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 100);
        } else {
            toast.error(result.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-600 text-center mb-8">
                    Register
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
                <p className="text-center mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}