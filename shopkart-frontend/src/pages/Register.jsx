import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', phone: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/customers/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Create ShopKart Account</h2>
                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="fullName" placeholder="Full Name" required 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email" required 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password (min 6 chars)" required minLength="6"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" onChange={handleChange} />
                    <input type="tel" name="phone" placeholder="Phone Number" required 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" onChange={handleChange} />
                    <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                        Create Account
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
