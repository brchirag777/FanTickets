import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    
    // Grab the fetchCart function from our global state
    const { fetchCart } = useCart();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/customers/login', formData);
            
            // Tell the context to fetch the cart now that we have a cookie
            await fetchCart();
            
            // 🌟 REDIRECT TO PRODUCTS
            navigate('/products'); 
        } catch (err) {
            setError('Invalid Credentials'); 
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
                
                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" name="email" placeholder="Email" required 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" 
                        onChange={handleChange} />
                    
                    <input type="password" name="password" placeholder="Password" required 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-blue-500" 
                        onChange={handleChange} />
                    
                    <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                        Login
                    </button>
                </form>
                
                <p className="text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
