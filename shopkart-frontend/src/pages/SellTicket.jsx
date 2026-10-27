import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const inputClass =
    "w-full p-3 text-white bg-zinc-950 border border-zinc-700 rounded-lg placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500";
const labelClass = "block mb-1 text-sm font-medium text-zinc-300";

const SellTicket = () => {
    const navigate = useNavigate();
    const { isLoggedIn, authLoading } = useAuth();
    const [formData, setFormData] = useState({
        name: '', price: '', stock: '1',
        venue: '', eventDate: '', section: '', originalFaceValue: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const overFaceValue =
        formData.price !== '' && formData.originalFaceValue !== '' &&
        Number(formData.price) > Number(formData.originalFaceValue);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const { name, venue, eventDate, section } = formData;
        const price = Number(formData.price);
        const stock = Number(formData.stock);
        const originalFaceValue = Number(formData.originalFaceValue);

        if (!name.trim() || !venue.trim() || !eventDate || !section.trim()) {
            return setError('Please fill in all the required fields.');
        }
        if (!(price > 0)) return setError('Price must be greater than 0.');
        if (!Number.isInteger(stock) || stock < 1) return setError('Quantity must be a whole number of at least 1.');
        if (formData.originalFaceValue === '' || originalFaceValue < 0) {
            return setError('Original face value must be 0 or more.');
        }

        setLoading(true);
        try {
            await api.post('/tickets', {
                name: name.trim(),
                price,
                stock,
                venue: venue.trim(),
                eventDate: new Date(eventDate).toISOString(),
                section: section.trim(),
                originalFaceValue
            });
            navigate('/tickets');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('You must be logged in to list a ticket.');
            } else {
                setError(err.response?.data?.message || 'Failed to list ticket.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-xl text-zinc-400">Loading...</p>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="max-w-xl px-4 py-16 mx-auto text-center">
                <div className="p-8 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <div className="text-5xl">🔒</div>
                    <h1 className="mt-4 text-2xl font-extrabold text-white">Login Required</h1>
                    <p className="mt-2 text-zinc-400">
                        You need to be logged in to list and sell concert tickets.
                    </p>
                    <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-center">
                        <Link 
                            to="/login" 
                            className="px-6 py-3 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500"
                        >
                            Log In
                        </Link>
                        <Link 
                            to="/register" 
                            className="px-6 py-3 font-medium transition-colors border rounded-lg text-zinc-100 border-zinc-700 hover:bg-zinc-800"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl px-4 py-10 mx-auto">
            <h1 className="text-3xl font-extrabold text-white">Sell Your Ticket</h1>
            <p className="mt-2 text-zinc-400">Can't make the show? List your ticket for a fellow fan.</p>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 p-6 mt-8 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg"
            >
                {error && (
                    <div className="p-3 text-sm text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">{error}</div>
                )}

                <div>
                    <label htmlFor="name" className={labelClass}>Event / Artist Name</label>
                    <input 
                        id="name" 
                        type="text" 
                        name="name" 
                        placeholder="e.g. Coldplay: Music of the Spheres" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className={inputClass} 
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="venue" className={labelClass}>Venue</label>
                        <input 
                            id="venue" 
                            type="text" 
                            name="venue" 
                            placeholder="e.g. DY Patil Stadium, Mumbai" 
                            value={formData.venue} 
                            onChange={handleChange} 
                            className={inputClass} 
                        />
                    </div>
                    <div>
                        <label htmlFor="eventDate" className={labelClass}>Event Date &amp; Time</label>
                        <input 
                            id="eventDate" 
                            type="datetime-local" 
                            name="eventDate" 
                            value={formData.eventDate} 
                            onChange={handleChange} 
                            className={`${inputClass} [color-scheme:dark]`} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="section" className={labelClass}>Section / Seat</label>
                        <input 
                            id="section" 
                            type="text" 
                            name="section" 
                            placeholder="e.g. Block A, Row 4 or Lounge" 
                            value={formData.section} 
                            onChange={handleChange} 
                            className={inputClass} 
                        />
                    </div>
                    <div>
                        <label htmlFor="stock" className={labelClass}>Quantity</label>
                        <input 
                            id="stock" 
                            type="number" 
                            min="1" 
                            step="1" 
                            name="stock" 
                            placeholder="e.g. 2" 
                            value={formData.stock} 
                            onChange={handleChange} 
                            className={inputClass} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="originalFaceValue" className={labelClass}>Original Face Value (₹)</label>
                        <input 
                            id="originalFaceValue" 
                            type="number" 
                            min="0" 
                            name="originalFaceValue" 
                            placeholder="e.g. 4500 (printed price)" 
                            value={formData.originalFaceValue} 
                            onChange={handleChange} 
                            className={inputClass} 
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className={labelClass}>Your Asking Price (₹)</label>
                        <input 
                            id="price" 
                            type="number" 
                            min="0.01" 
                            step="any" 
                            name="price" 
                            placeholder="e.g. 5000 (resale price)" 
                            value={formData.price} 
                            onChange={handleChange} 
                            className={inputClass} 
                        />
                    </div>
                </div>

                {overFaceValue && (
                    <p className="text-sm text-amber-400">
                        ⚠️ Your asking price is above face value. Buyers will see the markup on your listing.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-2 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Listing...' : '🎫 List Ticket'}
                </button>
            </form>
        </div>
    );
};

export default SellTicket;
