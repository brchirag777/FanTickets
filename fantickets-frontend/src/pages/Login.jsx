import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    
    const { fetchCart } = useCart();
    const { refreshUser } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/customers/login', formData);
            if (res.data?.token) {
                localStorage.setItem('token', res.data.token);
            }
            if (refreshUser) await refreshUser();
            await fetchCart();
            navigate('/tickets'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password'); 
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[75vh] px-4">
            <div className="w-full max-w-md p-8 space-y-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Welcome Back</h2>
                
                {error && <div className="p-3 text-sm text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-zinc-300">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="e.g. alex@example.com" 
                            required 
                            className="w-full p-3 text-white border rounded-lg bg-zinc-950 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-1 text-sm font-medium text-zinc-300">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            required 
                            className="w-full p-3 text-white border rounded-lg bg-zinc-950 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-3 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
                    >
                        Login
                    </button>
                </form>
                
                <p className="text-sm text-center text-zinc-400">
                    Don't have an account? <Link to="/register" className="text-fuchsia-400 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
