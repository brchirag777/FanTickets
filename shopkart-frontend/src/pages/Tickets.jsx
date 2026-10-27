import { useState, useEffect } from 'react';
import api from '../services/api';
import TicketCard from '../components/TicketCard';

const inputClass =
    "p-3 text-white bg-zinc-900 border border-zinc-700 rounded-lg placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500";

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter States
    const [search, setSearch] = useState('');
    const [venue, setVenue] = useState('');
    const [sort, setSort] = useState('');

    useEffect(() => {
        const fetchWishlistIds = async () => {
            try {
                const response = await api.get('/wishlist');
                const list = response.data?.wishlist || [];
                const ids = list.map(item => item?._id || item);
                setWishlistIds(ids);
            } catch (err) {
                // Not logged in or wishlist empty - fail silently
                setWishlistIds([]);
            }
        };
        fetchWishlistIds();
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (venue) params.append('venue', venue);
                if (sort) params.append('sort', sort);

                const response = await api.get(`/tickets?${params.toString()}`);
                setTickets(response.data?.tickets || []);
            } catch (err) {
                setError('Something went wrong while loading tickets.');
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchTickets();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, venue, sort]);

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-white">Live Tickets</h1>
                <p className="mt-2 mb-8 text-zinc-400">Fan-to-fan resale. Find your next show.</p>

                <div className="flex flex-col gap-4 mb-8 md:flex-row">
                    <input
                        type="text"
                        placeholder="Search artist or event..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`flex-grow ${inputClass}`}
                    />

                    <input
                        type="text"
                        placeholder="Filter by venue..."
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className={inputClass}
                    />

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Sort By</option>
                        <option value="date_asc">Event Date: Soonest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>

                {loading && <div className="py-10 text-xl text-center text-zinc-400">Loading tickets...</div>}
                {error && <div className="py-10 text-xl text-center text-red-400">{error}</div>}
                {!loading && !error && tickets.length === 0 && (
                    <div className="py-10 text-xl text-center text-zinc-400">No tickets found.</div>
                )}

                {!loading && !error && tickets.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {tickets.map(ticket => (
                            <TicketCard
                                key={ticket._id}
                                ticket={ticket}
                                isSaved={wishlistIds.includes(ticket._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tickets;
