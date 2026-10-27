import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Register = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const { fetchCart } = useCart();

    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullName') {
            const sanitizedValue = value.replace(/[0-9]/g, '');
            if (sanitizedValue !== value) {
                setError('Numbers are not allowed in the Full Name field.');
            } else if (error === 'Numbers are not allowed in the Full Name field.') {
                setError('');
            }
            return setFormData({ ...formData, [name]: sanitizedValue });
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedName = formData.fullName.trim();
        if (!trimmedName) {
            return setError('Full Name is required.');
        }
        if (/\d/.test(trimmedName)) {
            return setError('Full name cannot contain numbers.');
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
            return setError('Full name must contain only letters.');
        }

        setLoading(true);
        try {
            await api.post('/customers/register', formData);
            if (refreshUser) await refreshUser();
            if (fetchCart) await fetchCart();
            navigate('/tickets');

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-[75vh] px-4">
            <div className="w-full max-w-md p-8 space-y-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-white">Create Account</h2>
                {error && <div className="p-3 text-sm text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-zinc-300">Full Name</label>
                        <input 
                            type="text" 
                            name="fullName" 
                            placeholder="e.g. Rahul Sharma" 
                            required 
                            className="w-full p-3 text-white border rounded-lg bg-zinc-950 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" 
                            onChange={handleChange} 
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-zinc-300">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="e.g. rahul@example.com" 
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
                            placeholder="Min. 6 characters" 
                            required 
                            minLength="6"
                            className="w-full p-3 text-white border rounded-lg bg-zinc-950 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" 
                            onChange={handleChange} 
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-zinc-300">Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            placeholder="10-digit mobile number (e.g. 9876543210)" 
                            required 
                            maxLength="10"
                            className="w-full p-3 text-white border rounded-lg bg-zinc-950 border-zinc-700 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500" 
                            onChange={handleChange} 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-sm text-center text-zinc-400">
                    Already have an account? <Link to="/login" className="text-fuchsia-400 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
