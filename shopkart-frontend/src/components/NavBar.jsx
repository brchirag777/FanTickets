import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext'; 

const NavBar = () => {
    const navigate = useNavigate();
    const [wishlistCount, setWishlistCount] = useState(0);
    
    // Pull clearCart from the Context
    const { cartCount, clearCart } = useCart();

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const response = await axios.get('http://localhost:5001/wishlist', { withCredentials: true });
                setWishlistCount(response.data.count || 0);
            } catch (error) {
                console.error("Failed to fetch wishlist count");
            }
        };
        
        fetchCount(); 

        window.addEventListener('wishlist-updated', fetchCount);
        return () => window.removeEventListener('wishlist-updated', fetchCount);
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5001/customers/logout', {}, { withCredentials: true });
            
            // Wipe the frontend cart memory instantly!
            clearCart();
            
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="bg-gray-800 text-white shadow-md">
            <div className="max-w-6xl px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link to="/products" className="text-xl font-bold tracking-wider">
                        ShopKart
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/products" className="transition-colors hover:text-gray-300">
                            Products
                        </Link>
                        <Link to="/orders" className="font-medium transition-colors hover:text-green-400">
                            Orders
                        </Link>
                        <Link to="/wishlist" className="font-medium transition-colors hover:text-pink-400">
                            Wishlist ({wishlistCount})
                        </Link>
                        <Link to="/cart" className="font-medium transition-colors hover:text-blue-400">
                            Cart ({cartCount})
                        </Link>
                        <button onClick={handleLogout} className="px-4 py-2 transition-colors bg-gray-700 rounded hover:bg-gray-600">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;