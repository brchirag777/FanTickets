import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const navigate = useNavigate();
    const [wishlistCount, setWishlistCount] = useState(0);
    
    const { cartCount, clearCart } = useCart();
    const { user, isLoggedIn, authLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoggedIn) {
            setWishlistCount(0);
            return;
        }

        const fetchCount = async () => {
            try {
                const response = await api.get('/wishlist');
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
        <nav className="text-white border-b shadow-lg bg-zinc-900 border-zinc-800 sticky top-0 z-50">
            <div className="max-w-6xl px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link to="/tickets" className="text-xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400 flex items-center gap-2">
                        <span>🎸</span> FanTickets
                    </Link>

                    <div className="flex items-center space-x-5 text-sm">
                        <Link to="/tickets" className="transition-colors hover:text-fuchsia-400">
                            Tickets
                        </Link>
                        <Link to="/sell" className="transition-colors hover:text-fuchsia-400">
                            Sell Ticket
                        </Link>

                        {!authLoading && isLoggedIn ? (
                            <>
                                <Link to="/my-listings" className="font-medium transition-colors hover:text-fuchsia-400">
                                    My Listings
                                </Link>
                                <Link to="/orders" className="font-medium transition-colors hover:text-emerald-400">
                                    Orders
                                </Link>
                                <Link to="/wishlist" className="font-medium transition-colors hover:text-pink-400">
                                    Wishlist {wishlistCount > 0 && <span className="px-1.5 py-0.5 text-xs rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">{wishlistCount}</span>}
                                </Link>
                                <Link to="/cart" className="font-medium transition-colors hover:text-blue-400">
                                    Cart {cartCount > 0 && <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">{cartCount}</span>}
                                </Link>
                                <Link to="/profile" className="flex items-center gap-1.5 font-medium transition-colors hover:text-violet-400">
                                    <span>👤</span>
                                    <span>{user?.fullName ? user.fullName.split(' ')[0] : 'Profile'}</span>
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="px-3 py-1.5 transition-colors border rounded-md bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-red-400 text-xs font-semibold"
                                >
                                    Logout
                                </button>
                            </>
                        ) : !authLoading ? (
                            <div className="flex items-center gap-3">
                                <Link 
                                    to="/login" 
                                    className="px-4 py-2 font-semibold text-white transition-all rounded-md bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="px-3.5 py-2 font-medium text-zinc-300 transition-colors border rounded-md border-zinc-700 hover:bg-zinc-800 hover:text-white"
                                >
                                    Register
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;