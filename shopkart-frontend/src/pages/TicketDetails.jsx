import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatEventDate, formatPrice } from '../utils/format';

const TicketDetails = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { addToCart, isInCart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);

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

    const handleAddToCart = async () => {
        setCartLoading(true);
        const result = await addToCart(ticket._id);
        setCartLoading(false);

        if (!result?.success) {
            alert(result?.message || 'Failed to add to cart');
        }
    };

    if (loading) return <div className="mt-20 text-xl text-center text-zinc-400">Loading ticket details...</div>;
    if (error) return <div className="mt-20 text-xl text-center text-red-400">{error}</div>;
    if (!ticket) return null;

    const inCart = typeof isInCart === 'function' ? isInCart(ticket._id) : false;
    const soldOut = (ticket.stock ?? 0) < 1;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl p-8 mx-auto border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                <Link to="/tickets" className="inline-block mb-6 text-fuchsia-400 hover:underline">
                    &larr; Back to Tickets
                </Link>

                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="md:w-1/2">
                        {ticket.image ? (
                            <img
                                src={ticket.image}
                                alt={ticket.name}
                                className="object-cover w-full h-auto rounded-xl"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full min-h-[250px] h-full rounded-xl bg-gradient-to-br from-fuchsia-950 via-zinc-900 to-violet-950">
                                <span className="text-6xl">🎫</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:w-1/2">
                        <span className="text-sm font-semibold tracking-widest uppercase text-fuchsia-400">
                            Section {ticket.section}
                        </span>
                        <h1 className="mt-2 text-3xl font-extrabold text-white">{ticket.name}</h1>

                        <div className="flex flex-col gap-2 mt-4 text-zinc-400">
                            <p>📍 <span className="text-zinc-100">{ticket.venue}</span></p>
                            <p>🗓️ <span className="text-zinc-100">{formatEventDate(ticket.eventDate)}</span></p>
                            {ticket.seller?.fullName && <p>🎟️ Sold by <span className="text-zinc-100">{ticket.seller.fullName}</span></p>}
                        </div>

                        <p className="mt-6 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                            {formatPrice(ticket.price)}
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">Original face value: {formatPrice(ticket.originalFaceValue)}</p>
                        <p className="mt-2 text-zinc-400">{soldOut ? 'Sold out' : `${ticket.stock} tickets available`}</p>

                        <button
                            onClick={handleAddToCart}
                            disabled={cartLoading || soldOut}
                            className={`w-full py-3 mt-8 text-lg font-bold text-white transition-all rounded-lg ${soldOut
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : (inCart ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500')
                                }`}
                        >
                            {cartLoading ? '⏳ Adding...' : (
                                soldOut ? 'Sold Out' : (inCart ? '➕ Add Another (+1)' : '🎫 Add to Cart')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
