import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatEventDate, formatPrice } from '../utils/format';

const Cart = () => {
    // Instantly grab everything we need from our global Context bubble
    const { cart, loading, cartCount, subtotal, updateQuantity, removeFromCart } = useCart();

    // 1. Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-xl text-zinc-400">⏳ Loading your cart...</p>
            </div>
        );
    }

    // 2. Empty State
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 mt-10 text-center">
                <div className="text-5xl">🎫</div>
                <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
                <p className="text-zinc-400">Looks like you haven't picked any tickets yet.</p>
                <Link to="/tickets" className="px-6 py-2 mt-4 text-white transition-colors rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500">
                    Browse Tickets
                </Link>
            </div>
        );
    }

    // 3. Populated Cart State
    return (
        <div className="max-w-6xl p-4 mx-auto mt-8">
            <h1 className="mb-8 text-3xl font-extrabold text-white">My Cart</h1>
            
            <div className="flex flex-col gap-8 lg:flex-row">
                
                <div className="flex flex-col flex-grow gap-4">
                    {cart.map((item) => {
                        const ticket = item.product || item.ticket;
                        // Safety check in case a ticket is deleted from the database
                        if (!ticket) return null; 

                        return (
                            <div key={ticket._id} className="flex flex-col items-center gap-6 p-4 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg sm:flex-row">
                                {ticket.image ? (
                                    <img src={ticket.image} alt={ticket.name} className="object-cover w-24 h-24 rounded-lg sm:w-32 sm:h-32 shrink-0" />
                                ) : (
                                    <div className="flex items-center justify-center w-24 h-24 rounded-lg bg-gradient-to-br from-fuchsia-950 to-violet-950 sm:w-32 sm:h-32 shrink-0">
                                        <span className="text-3xl">🎫</span>
                                    </div>
                                )}
                                
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-white">{ticket.name}</h3>
                                    {ticket.venue && <p className="mt-1 text-sm text-zinc-400">📍 {ticket.venue} · Sec {ticket.section}</p>}
                                    {ticket.eventDate && <p className="text-sm text-zinc-400">🗓️ {formatEventDate(ticket.eventDate)}</p>}
                                    <p className="mt-1 text-lg font-extrabold text-fuchsia-400">{formatPrice(ticket.price)}</p>
                                    <p className="text-sm text-zinc-500">{ticket.stock} left</p>
                                </div>
                                
                                <div className="flex flex-col items-center gap-2 sm:items-end">
                                    <div className="flex items-center border rounded-lg border-zinc-700">
                                        <button 
                                            id={`decrease-qty-${ticket._id}`}
                                            onClick={() => updateQuantity(ticket._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="px-3 py-1 font-bold text-white transition-colors rounded-l-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={item.quantity <= 1 ? "Minimum 1 ticket" : "Decrease quantity"}
                                        >
                                            -
                                        </button>
                                        <span className="w-12 px-2 font-semibold text-center text-white">{item.quantity}</span>
                                        <button 
                                            id={`increase-qty-${ticket._id}`}
                                            onClick={() => updateQuantity(ticket._id, item.quantity + 1)}
                                            disabled={item.quantity >= (ticket?.stock ?? 1)}
                                            className="px-3 py-1 font-bold text-white transition-colors rounded-r-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={item.quantity >= (ticket?.stock ?? 1) ? `Only ${ticket.stock} tickets available` : "Increase quantity"}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {item.quantity >= (ticket?.stock ?? 1) && (
                                        <span className="text-xs text-amber-400 font-medium">
                                            Max available ({ticket.stock})
                                        </span>
                                    )}
                                    
                                    <button 
                                        onClick={() => removeFromCart(ticket._id)}
                                        className="text-sm font-medium text-red-400 transition-colors hover:text-red-300 mt-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="sticky w-full p-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg lg:w-1/3 h-fit top-6">
                    <h2 className="mb-6 text-2xl font-bold text-white">Order Summary</h2>
                    <div className="flex justify-between mb-4 text-zinc-400">
                        <span>Tickets in Cart:</span>
                        <span className="font-medium text-white">{cartCount}</span>
                    </div>
                    <div className="flex justify-between pt-4 mb-6 text-xl font-bold text-white border-t border-zinc-800">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    
                    <Link 
                        to="/checkout" 
                        className="block w-full py-3 font-bold text-center text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
                    >
                        Proceed to Checkout
                    </Link>

                </div>
                
            </div>
        </div>
    );
};

export default Cart;
