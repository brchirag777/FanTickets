import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { formatEventDate, formatPrice } from '../utils/format';

const TicketCard = ({ ticket, isSaved }) => {
    const [saved, setSaved] = useState(isSaved);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const { addToCart, isInCart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);

    const inCart = typeof isInCart === 'function' ? isInCart(ticket?._id) : false;
    const soldOut = (ticket?.stock ?? 0) < 1;
    const markup = ticket?.originalFaceValue > 0
        ? Math.round(((ticket.price - ticket.originalFaceValue) / ticket.originalFaceValue) * 100)
        : 0;

    useEffect(() => {
        setSaved(isSaved);
    }, [isSaved]);

    const handleToggleWishlist = async () => {
        setWishlistLoading(true);
        try {
            const response = await axios.patch(
                `http://localhost:5001/wishlist/${ticket._id}/toggle`,
                {},
                { withCredentials: true }
            );
            setSaved(response.data.saved);
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch (error) {
            alert('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setCartLoading(true);
        const result = await addToCart(ticket._id);
        setCartLoading(false);

        if (!result?.success) {
            alert(result?.message || 'Failed to add to cart');
        }
    };

    return (
        <div className="group flex flex-col overflow-hidden transition-all duration-300 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg hover:-translate-y-1 hover:border-fuchsia-500/60 hover:shadow-fuchsia-500/20">
            <div className="relative">
                {ticket?.image ? (
                    <img
                        src={ticket.image}
                        alt={ticket.name}
                        className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-48 transition-transform duration-500 bg-gradient-to-br from-fuchsia-950 via-zinc-900 to-violet-950 group-hover:scale-105">
                        <span className="text-5xl">🎫</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none" />
                <span className="absolute px-2 py-1 text-xs font-bold tracking-wider text-white uppercase rounded-md top-3 left-3 bg-fuchsia-600/90">
                    Section {ticket.section}
                </span>
                {markup !== 0 && (
                    <span className={`absolute px-2 py-1 text-xs font-bold rounded-md top-3 right-3 ${markup > 0 ? 'bg-amber-500/90 text-black' : 'bg-emerald-500/90 text-black'
                        }`}>
                        {markup > 0 ? `+${markup}%` : `${markup}%`} vs face
                    </span>
                )}
            </div>

            <div className="flex flex-col flex-grow p-4">
                <h3 className="text-lg font-bold text-white">{ticket.name}</h3>

                <div className="flex flex-col gap-1 mt-2 text-sm text-zinc-400">
                    <p>📍 <span className="text-zinc-200">{ticket.venue}</span></p>
                    <p>🗓️ <span className="text-zinc-200">{formatEventDate(ticket.eventDate)}</span></p>
                    {ticket.seller?.fullName && <p>🎟️ Sold by {ticket.seller.fullName}</p>}
                </div>

                <div className="flex items-end justify-between mt-4">
                    <div>
                        <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                            {formatPrice(ticket.price)}
                        </p>
                        <p className="text-xs text-zinc-500">Face value {formatPrice(ticket.originalFaceValue)}</p>
                    </div>
                    <p className={`text-sm font-medium ${soldOut ? 'text-red-400' : 'text-zinc-400'}`}>
                        {soldOut ? 'Sold out' : `${ticket.stock} left`}
                    </p>
                </div>

                <div className="flex flex-col gap-2 pt-4 mt-auto">
                    <Link
                        to={`/tickets/${ticket._id}`}
                        className="block w-full py-2 text-center text-zinc-100 transition-colors border rounded-lg border-zinc-700 hover:bg-zinc-800"
                    >
                        View Details
                    </Link>

                    <button
                        onClick={handleAddToCart}
                        disabled={cartLoading || soldOut}
                        className={`w-full py-2 text-center rounded-lg font-semibold transition-all ${soldOut
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : (inCart
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                    : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500')
                            }`}
                    >
                        {cartLoading ? '⏳ Adding...' : (
                            soldOut ? 'Sold Out' : (inCart ? '➕ Add Another (+1)' : '🎫 Add to Cart')
                        )}
                    </button>

                    <button
                        onClick={handleToggleWishlist}
                        disabled={wishlistLoading}
                        className={`w-full py-2 text-center border rounded-lg font-medium transition-colors ${saved
                                ? 'bg-pink-500/10 text-pink-400 border-pink-500/40 hover:bg-pink-500/20'
                                : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800'
                            }`}
                    >
                        {wishlistLoading ? '⏳ Updating...' : (saved ? '♥ Saved' : '♡ Save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
