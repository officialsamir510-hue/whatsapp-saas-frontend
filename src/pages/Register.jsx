import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(formData);
            toast.success('Registration successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-green-600 text-center mb-8">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Company</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full border rounded-lg px-4 py-3"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold">
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                <p className="text-center mt-6">
                    Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}