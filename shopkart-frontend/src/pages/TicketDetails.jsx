import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatEventDate, formatPrice } from '../utils/format';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { addToCart, isInCart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/tickets/${id}`);
                setTicket(response.data.ticket);
            } catch (err) {
                setError('Ticket not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const isSeller = Boolean(
        user?._id && ticket && (
            (ticket.seller?._id && ticket.seller._id.toString() === user._id.toString()) ||
            (ticket.seller && ticket.seller.toString() === user._id.toString())
        )
    );

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        if (isSeller) {
            return alert("You cannot purchase your own ticket listing.");
        }
        setCartLoading(true);
        const result = await addToCart(ticket._id);
        setCartLoading(false);

        if (!result?.success) {
            alert(result?.message || 'Failed to add to cart');
        }
    };

    const handleBuyNow = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        if (isSeller) {
            return alert("You cannot purchase your own ticket listing.");
        }
        setBuyNowLoading(true);
        if (!inCart) {
            const result = await addToCart(ticket._id);
            if (!result?.success) {
                setBuyNowLoading(false);
                return alert(result?.message || 'Failed to reserve ticket for checkout');
            }
        }
        setBuyNowLoading(false);
        navigate('/checkout');
    };

    if (loading) return <div className="mt-20 text-xl text-center text-zinc-400">Loading ticket details...</div>;
    if (error) return <div className="mt-20 text-xl text-center text-red-400">{error}</div>;
    if (!ticket) return null;

    const inCart = typeof isInCart === 'function' ? isInCart(ticket._id) : false;
    const soldOut = (ticket.stock ?? 0) < 1;
    const markup = ticket.originalFaceValue > 0
        ? Math.round(((ticket.price - ticket.originalFaceValue) / ticket.originalFaceValue) * 100)
        : 0;

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl p-6 sm:p-8 mx-auto border bg-zinc-900 border-zinc-800 rounded-2xl shadow-xl">
                <Link to="/tickets" className="inline-block mb-6 text-fuchsia-400 hover:underline text-sm font-semibold">
                    &larr; Back to Live Tickets
                </Link>

                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="md:w-1/2">
                        {ticket.image ? (
                            <img
                                src={ticket.image}
                                alt={ticket.name}
                                className="object-cover w-full h-80 rounded-xl shadow-md"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-80 rounded-xl bg-gradient-to-br from-fuchsia-950 via-zinc-900 to-violet-950 shadow-md">
                                <span className="text-7xl">🎫</span>
                            </div>
                        )}

                        {/* Fan Guarantee Highlights */}
                        <div className="p-4 mt-4 border rounded-xl bg-zinc-950/60 border-zinc-800/80 space-y-2 text-xs text-zinc-300">
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-400 text-sm">✓</span>
                                <span><strong>Anti-Scalping Verified:</strong> Price capped at 120% of face value.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-fuchsia-400 text-sm">✓</span>
                                <span><strong>Verified Attendee Transfer:</strong> Name &amp; Govt ID matched on transfer.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-violet-400 text-sm">✓</span>
                                <span><strong>Instant Digital Pass:</strong> E-Ticket generated immediately on payment.</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:w-1/2">
                        <div className="flex flex-col items-start gap-1.5">
                            <span className="px-2.5 py-1 text-xs font-bold tracking-wider uppercase text-white rounded-md bg-fuchsia-600/90 shadow">
                                Section {ticket.section}
                            </span>
                            {markup !== 0 && (
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${
                                    markup > 0 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                                }`}>
                                    {markup > 0 ? `+${markup}%` : `${markup}%`} vs Face
                                </span>
                            )}
                        </div>

                        <h1 className="mt-3 text-3xl font-extrabold text-white leading-tight">{ticket.name}</h1>

                        <div className="flex flex-col gap-2 mt-4 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800 text-sm text-zinc-400">
                            <p>📍 Venue: <span className="font-semibold text-zinc-100">{ticket.venue}</span></p>
                            <p>🗓️ Date: <span className="font-semibold text-zinc-100">{formatEventDate(ticket.eventDate)}</span></p>
                            {ticket.seller?.fullName && (
                                <p>🎟️ Listed by: <span className="font-semibold text-zinc-100">{ticket.seller.fullName}</span></p>
                            )}
                        </div>

                        <div className="mt-6">
                            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                                {formatPrice(ticket.price)}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Original printed face value: <span className="text-zinc-400">{formatPrice(ticket.originalFaceValue)}</span>
                            </p>
                            <p className={`mt-2 text-sm font-semibold ${soldOut ? 'text-red-400' : 'text-emerald-400'}`}>
                                {soldOut ? '● Sold Out' : `● ${ticket.stock} ticket${ticket.stock > 1 ? 's' : ''} available`}
                            </p>
                        </div>

                        {isSeller ? (
                            <div className="p-4 mt-8 border rounded-xl bg-violet-950/40 border-violet-800/60">
                                <p className="font-semibold text-violet-200">👤 You listed this ticket</p>
                                <p className="mt-1 text-xs text-zinc-400">
                                    As the seller, you cannot purchase or add your own listing to cart.
                                </p>
                                <Link
                                    to="/my-listings"
                                    className="block w-full py-3 mt-4 font-bold text-center text-white transition-all rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                                >
                                    ⚙️ Manage in My Listings
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={buyNowLoading || soldOut}
                                    className={`w-full py-3 text-lg font-bold text-white transition-all rounded-xl shadow-lg ${soldOut
                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-fuchsia-600/20'
                                        }`}
                                >
                                    {buyNowLoading ? 'Reserving...' : (soldOut ? 'Sold Out' : '⚡ Buy Now & Checkout')}
                                </button>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartLoading || soldOut}
                                    className={`w-full py-2.5 font-semibold transition-all rounded-xl border ${soldOut
                                            ? 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : (inCart 
                                                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                                                : 'border-zinc-700 text-zinc-200 hover:bg-zinc-800')
                                        }`}
                                >
                                    {cartLoading ? '⏳ Adding...' : (
                                        soldOut ? 'Unavailable' : (inCart ? '✓ In Cart (+1)' : '🛒 Add to Cart')
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
