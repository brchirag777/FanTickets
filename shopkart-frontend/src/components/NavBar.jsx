import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const navigate = useNavigate();
    const [wishlistCount, setWishlistCount] = useState(0);
    
    // Pull clearCart from the Context
    const { cartCount, clearCart } = useCart();
    const { isLoggedIn, authLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoggedIn) {
            setWishlistCount(0);
            return;
        }

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
    }, [isLoggedIn]);

    const handleLogout = async () => {
        try {
            await logout();
            clearCart();
            setWishlistCount(0);
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="text-white border-b shadow-md bg-zinc-900 border-zinc-800">
            <div className="max-w-6xl px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link to="/tickets" className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                        🎸 FanTickets
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/tickets" className="transition-colors hover:text-fuchsia-400">
                            Tickets
                        </Link>
                        <Link to="/sell" className="transition-colors hover:text-fuchsia-400">
                            Sell Ticket
                        </Link>

                        {!authLoading && isLoggedIn ? (
                            <>
                                <Link to="/orders" className="font-medium transition-colors hover:text-green-400">
                                    Orders
                                </Link>
                                <Link to="/wishlist" className="font-medium transition-colors hover:text-pink-400">
                                    Wishlist ({wishlistCount})
                                </Link>
                                <Link to="/cart" className="font-medium transition-colors hover:text-blue-400">
                                    Cart ({cartCount})
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="px-4 py-2 transition-colors border rounded-md bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-red-400"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !authLoading ? (
                            <Link 
                                to="/login" 
                                className="px-4 py-2 font-semibold text-white transition-all rounded-md bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
                            >
                                Login
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;