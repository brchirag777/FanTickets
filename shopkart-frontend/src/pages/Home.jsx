import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/customers/me');
                setCustomer(response.data);
            } catch (error) {
                // If unauthorized (no token/cookie), redirect to login
                navigate('/login'); 
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/customers/logout');
            navigate('/login');
        } catch (error) {
            console.error("Logout failed");
        }
    };

    // Show a loading state while fetching data
    if (!customer) return <div className="mt-20 text-center text-gray-600">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="flex items-center justify-between p-4 text-white bg-blue-600 shadow-md">
                <h1 className="text-xl font-bold">ShopKart</h1>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 rounded hover:bg-red-600">
                    Logout
                </button>
            </nav>

            {/* Profile Content */}
            <div className="max-w-2xl p-8 mx-auto mt-10 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {customer.fullName}!</h2>
                <div className="mt-6 space-y-3 text-gray-600">
                    <p><strong className="text-gray-800">Email:</strong> {customer.email}</p>
                    <p><strong className="text-gray-800">Phone:</strong> {customer.phone}</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
