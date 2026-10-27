import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatEventDate, formatPrice } from '../utils/format';

const TicketCard = ({ ticket, isSaved }) => {
    const [saved, setSaved] = useState(isSaved);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const { user } = useAuth();
    const { addToCart, isInCart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);

    const isSeller = Boolean(
        user?._id && (
            (ticket.seller?._id && ticket.seller._id.toString() === user._id.toString()) ||
            (ticket.seller && ticket.seller.toString() === user._id.toString())
        )
    );

    const inCart = typeof isInCart === 'function' ? isInCart(ticket?._id) : false;
    const soldOut = (ticket?.stock ?? 0) < 1;
    const markup = ticket?.originalFaceValue > 0
        ? Math.round(((ticket.price - ticket.originalFaceValue) / ticket.originalFaceValue) * 100)
        : 0;

    useEffect(() => {
        setSaved(isSaved);
    }, [isSaved]);

    const handleToggleWishlist = async () => {
        if (isSeller) {
            return alert("You cannot save your own ticket listing to wishlist.");
        }
        if (soldOut && !saved) {
            return alert("Sold out tickets cannot be added to wishlist.");
        }
        setWishlistLoading(true);
        try {
            const response = await api.patch(`/wishlist/${ticket._id}/toggle`);
            setSaved(response.data.saved);
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };


    const handleAddToCart = async () => {
        if (isSeller) {
            return alert("You cannot purchase or add your own ticket listing to cart.");
        }
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
                <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
                    <span className="px-2 py-1 text-xs font-bold tracking-wider text-white uppercase rounded-md bg-fuchsia-600/90 shadow backdrop-blur-sm">
                        Section {ticket.section}
                    </span>
                    {markup !== 0 && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md shadow backdrop-blur-sm ${markup > 0 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                            }`}>
                            {markup > 0 ? `+${markup}%` : `${markup}%`} vs face
                        </span>
                    )}
                </div>
                {isSeller && (
                    <span className="absolute px-2 py-1 text-xs font-bold tracking-wider text-white uppercase rounded-md bottom-3 left-3 bg-violet-600/90 shadow-md backdrop-blur-sm">
                        👤 Your Listing
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

                    {isSeller ? (
                        <div className="flex flex-col gap-1.5">
                            <Link
                                to="/my-listings"
                                className="block w-full py-2 text-center font-semibold text-white transition-colors border rounded-lg bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                            >
                                ⚙️ Manage in My Listings
                            </Link>
                            <span className="text-center text-xs text-zinc-500 italic">
                                Your listing (cannot purchase/wishlist)
                            </span>
                        </div>
                    ) : (
                        <>
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
                                disabled={wishlistLoading || (soldOut && !saved)}
                                title={soldOut && !saved ? "Sold out tickets cannot be wishlisted" : (saved ? "Remove from wishlist" : "Save to wishlist")}
                                className={`w-full py-2 text-center border rounded-lg font-medium transition-colors ${
                                    soldOut && !saved
                                        ? 'bg-zinc-800/40 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'
                                        : (saved
                                            ? 'bg-pink-500/10 text-pink-400 border-pink-500/40 hover:bg-pink-500/20'
                                            : 'bg-transparent text-zinc-400 border-zinc-700 hover:bg-zinc-800')
                                    }`}
                            >
                                {wishlistLoading ? '⏳ Updating...' : (soldOut && !saved ? '♡ Unavailable' : (saved ? '♥ Saved' : '♡ Save'))}
                            </button>

                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
