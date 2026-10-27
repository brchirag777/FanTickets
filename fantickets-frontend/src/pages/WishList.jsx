import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatEventDate, formatPrice } from '../utils/format';

const WishList = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await axios.get('http://localhost:5001/wishlist', {
                withCredentials: true 
            });
            setWishlist(response.data.wishlist || []);
            setLoading(false);
        } catch (err) {
            setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (ticketId) => {
        try {
            await axios.delete(`http://localhost:5001/wishlist/${ticketId}`, {
                withCredentials: true
            });
            setWishlist(wishlist.filter(item => item._id !== ticketId));
            
            // Shout to the NavBar that an item was removed!
            window.dispatchEvent(new Event('wishlist-updated'));
            
        } catch (err) {
            alert("Failed to remove ticket");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-xl text-zinc-400">⏳ Loading your wishlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-xl text-red-400">Unable to load wishlist.</p>
                <button onClick={fetchWishlist} className="px-4 py-2 text-white rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500">
                    Try Again
                </button>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="text-4xl">❤️</div>
                <h2 className="text-2xl font-bold text-white">Your wishlist is empty</h2>
                <p className="text-zinc-400">Save tickets to shows you want to catch.</p>
                <Link to="/tickets" className="px-6 py-2 mt-4 text-white rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500">
                    Browse Tickets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl p-4 mx-auto">
            <h1 className="mb-6 text-2xl font-extrabold text-white">My Wishlist ({wishlist.length} tickets)</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {wishlist.map((ticket) => {
                    if (!ticket) return null;
                    return (
                        <div key={ticket._id} className="flex flex-col p-4 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                            {ticket.image ? (
                                <img src={ticket.image} alt={ticket.name} className="object-cover w-full h-48 mb-4 rounded-lg"/>
                            ) : (
                                <div className="flex items-center justify-center w-full h-48 mb-4 rounded-lg bg-gradient-to-br from-fuchsia-950 to-violet-950">
                                    <span className="text-4xl">🎫</span>
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-white">{ticket.name}</h3>
                            {ticket.venue && <p className="mt-1 text-sm text-zinc-400">📍 {ticket.venue} · Sec {ticket.section}</p>}
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xl font-extrabold text-fuchsia-400">{formatPrice(ticket.price)}</p>
                                {(ticket.stock ?? 0) < 1 && (
                                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                                        Sold Out
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-auto">
                                <Link to={`/tickets/${ticket._id}`} className="block w-full py-2 text-center transition-colors border rounded-lg text-zinc-100 border-zinc-700 hover:bg-zinc-800">
                                    View Details
                                </Link>
                                <button onClick={() => handleRemove(ticket._id)} className="block w-full py-2 text-center text-pink-400 transition-colors border rounded-lg bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20">
                                    Remove ♥
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WishList;
