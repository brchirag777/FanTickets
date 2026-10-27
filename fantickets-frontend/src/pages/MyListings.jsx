import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatEventDate, formatPrice } from '../utils/format';

const inputClass =
    "w-full p-2.5 text-white bg-zinc-950 border border-zinc-700 rounded-lg placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 text-sm";
const labelClass = "block mb-1 text-xs font-semibold text-zinc-300 uppercase tracking-wider";

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [actionMsg, setActionMsg] = useState('');

    // Edit Modal State
    const [editingTicket, setEditingTicket] = useState(null);
    const [editForm, setEditForm] = useState({
        price: '',
        stock: '',
        section: '',
        venue: ''
    });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const fetchListings = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/tickets/my/listings');
            setListings(response.data.tickets || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load your listings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleDelete = async (ticketId, ticketName) => {
        const confirmed = window.confirm(`Are you sure you want to delete your listing for "${ticketName}"?`);
        if (!confirmed) return;

        setDeletingId(ticketId);
        setActionMsg('');
        try {
            await api.delete(`/tickets/${ticketId}`);
            setListings((prev) => prev.filter((t) => t._id !== ticketId));
            setActionMsg(`Listing "${ticketName}" was deleted successfully.`);
            setTimeout(() => setActionMsg(''), 4000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete ticket listing.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenEdit = (ticket) => {
        setEditingTicket(ticket);
        setEditForm({
            price: ticket.price,
            stock: ticket.stock,
            section: ticket.section || '',
            venue: ticket.venue || ''
        });
        setEditError('');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError('');

        const newPrice = Number(editForm.price);
        const newStock = Number(editForm.stock);
        const faceValue = Number(editingTicket.originalFaceValue);

        if (!(newPrice > 0)) return setEditError('Price must be greater than 0.');
        if (!Number.isInteger(newStock) || newStock < 0) return setEditError('Stock must be a whole number of at least 0.');

        // Anti-scalping check
        if (faceValue > 0 && newPrice > faceValue * 1.20) {
            return setEditError(`Anti-Scalping Rule: Price cannot exceed 120% of face value (Max: ₹${(faceValue * 1.20).toFixed(0)}).`);
        }

        setEditSaving(true);
        try {
            const response = await api.patch(`/tickets/${editingTicket._id}`, {
                price: newPrice,
                stock: newStock,
                section: editForm.section.trim(),
                venue: editForm.venue.trim()
            });

            // Update in local state
            setListings((prev) =>
                prev.map((t) => (t._id === editingTicket._id ? response.data.ticket : t))
            );
            setActionMsg(`Listing "${editingTicket.name}" was updated successfully.`);
            setEditingTicket(null);
            setTimeout(() => setActionMsg(''), 4000);
        } catch (err) {
            setEditError(err.response?.data?.message || 'Failed to update ticket.');
        } finally {
            setEditSaving(false);
        }
    };

    // Calculate Analytics
    const totalListings = listings.length;
    const totalStock = listings.reduce((sum, t) => sum + (t.stock || 0), 0);
    const totalPortfolioValue = listings.reduce((sum, t) => sum + (t.price * (t.stock || 0)), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-xl text-zinc-400">Loading your ticket listings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md px-4 py-16 mx-auto text-center">
                <div className="p-8 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <p className="text-lg text-red-400">{error}</p>
                    <button
                        onClick={fetchListings}
                        className="px-6 py-2 mt-4 text-white transition-colors rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl px-4 py-10 mx-auto">
            <div className="flex flex-col items-start justify-between gap-4 pb-6 border-b sm:flex-row sm:items-center border-zinc-800">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">My Ticket Listings</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        Manage tickets you have listed for fellow fans with verified anti-scalping compliance.
                    </p>
                </div>
                <Link
                    to="/sell"
                    className="px-5 py-2.5 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md"
                >
                    + List Another Ticket
                </Link>
            </div>

            {/* Seller Analytics Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4">
                <div className="p-4 border bg-zinc-900/80 border-zinc-800 rounded-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Listings</p>
                    <p className="mt-1 text-2xl font-black text-white">{totalListings}</p>
                </div>
                <div className="p-4 border bg-zinc-900/80 border-zinc-800 rounded-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Stock</p>
                    <p className="mt-1 text-2xl font-black text-fuchsia-400">{totalStock} tickets</p>
                </div>
                <div className="p-4 border bg-zinc-900/80 border-zinc-800 rounded-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Inventory Value</p>
                    <p className="mt-1 text-2xl font-black text-violet-400">{formatPrice(totalPortfolioValue)}</p>
                </div>
                <div className="p-4 border bg-zinc-900/80 border-zinc-800 rounded-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Scalp Protection</p>
                    <p className="mt-1 text-sm font-bold text-emerald-400 flex items-center gap-1">
                        <span>🛡️</span> 100% Compliant
                    </p>
                </div>
            </div>

            {actionMsg && (
                <div className="p-4 mt-6 text-sm text-emerald-300 border rounded-xl bg-emerald-500/10 border-emerald-500/30">
                    ✓ {actionMsg}
                </div>
            )}

            {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl">🎟️</div>
                    <h2 className="mt-4 text-2xl font-bold text-white">You haven't listed any tickets yet</h2>
                    <p className="mt-2 text-zinc-400">Have extra concert passes? List them securely for fellow fans.</p>
                    <Link
                        to="/sell"
                        className="px-6 py-3 mt-6 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
                    >
                        List a Ticket Now
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                    {listings.map((ticket) => {
                        const markup = ticket.originalFaceValue > 0
                            ? Math.round(((ticket.price - ticket.originalFaceValue) / ticket.originalFaceValue) * 100)
                            : 0;
                        const isSoldOut = (ticket.stock ?? 0) < 1;

                        return (
                            <div
                                key={ticket._id}
                                className="flex flex-col overflow-hidden border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg transition-all hover:border-zinc-700"
                            >
                                <div className="relative">
                                    {ticket.image ? (
                                        <img
                                            src={ticket.image}
                                            alt={ticket.name}
                                            className="object-cover w-full h-44"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-44 bg-gradient-to-br from-fuchsia-950 via-zinc-900 to-violet-950">
                                            <span className="text-5xl">🎫</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
                                        <span className="px-2 py-1 text-xs font-bold tracking-wider text-white uppercase rounded-md bg-fuchsia-600/90 shadow backdrop-blur-sm">
                                            Section {ticket.section}
                                        </span>
                                        {markup !== 0 && (
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md shadow backdrop-blur-sm ${
                                                markup > 0 ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
                                            }`}>
                                                {markup > 0 ? `+${markup}%` : `${markup}%`} vs face
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col flex-grow p-5">
                                    <h3 className="text-lg font-bold text-white line-clamp-1">{ticket.name}</h3>
                                    
                                    <div className="flex flex-col gap-1 mt-2 text-xs text-zinc-400">
                                        <p>📍 <span className="text-zinc-200">{ticket.venue}</span></p>
                                        <p>🗓️ <span className="text-zinc-200">{formatEventDate(ticket.eventDate)}</span></p>
                                    </div>

                                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-zinc-800">
                                        <div>
                                            <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                                                {formatPrice(ticket.price)}
                                            </p>
                                            <p className="text-xs text-zinc-500">Face value: {formatPrice(ticket.originalFaceValue)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                                isSoldOut ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            }`}>
                                                {isSoldOut ? 'Sold Out' : `${ticket.stock} left`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-6 pt-2">
                                        <Link
                                            to={`/tickets/${ticket._id}`}
                                            className="py-2 text-xs font-semibold text-center text-zinc-200 transition-colors border rounded-lg border-zinc-700 hover:bg-zinc-800"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleOpenEdit(ticket)}
                                            className="py-2 text-xs font-semibold text-center text-fuchsia-400 transition-colors border rounded-lg bg-fuchsia-500/10 border-fuchsia-500/30 hover:bg-fuchsia-500/20"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ticket._id, ticket.name)}
                                            disabled={deletingId === ticket._id}
                                            className="py-2 text-xs font-semibold text-center text-red-400 transition-colors border rounded-lg bg-red-500/10 border-red-500/30 hover:bg-red-500/20 disabled:opacity-50"
                                        >
                                            {deletingId === ticket._id ? '...' : '🗑️ Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Ticket Modal */}
            {editingTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-lg p-6 border bg-zinc-900 border-zinc-700 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                            <h2 className="text-xl font-bold text-white">Edit Listing: {editingTicket.name}</h2>
                            <button
                                onClick={() => setEditingTicket(null)}
                                className="text-zinc-400 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {editError && (
                            <div className="p-3 my-4 text-xs text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">
                                {editError}
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Resale Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Max allowed: ₹{(Number(editingTicket.originalFaceValue) * 1.20).toFixed(0)}
                                    </p>
                                </div>

                                <div>
                                    <label className={labelClass}>Stock (Quantity)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.stock}
                                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Venue</label>
                                <input
                                    type="text"
                                    value={editForm.venue}
                                    onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Section / Seat</label>
                                <input
                                    type="text"
                                    value={editForm.section}
                                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingTicket(null)}
                                    className="flex-1 py-2.5 font-semibold text-zinc-300 border rounded-lg border-zinc-700 hover:bg-zinc-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="flex-1 py-2.5 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50"
                                >
                                    {editSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListings;
