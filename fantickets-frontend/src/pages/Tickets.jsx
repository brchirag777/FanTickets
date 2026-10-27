import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TicketCard from '../components/TicketCard';

const inputClass =
    "p-3 text-white bg-zinc-900 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 text-sm";

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter States
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');

    useEffect(() => {
        const fetchWishlistIds = async () => {
            try {
                const response = await api.get('/wishlist');
                const list = response.data?.wishlist || [];
                const ids = list.map(item => item?._id || item);
                setWishlistIds(ids);
            } catch (err) {
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
                if (sort) params.append('sort', sort);

                const response = await api.get(`/tickets?${params.toString()}`);
                let list = response.data?.tickets || [];
                if (maxPriceFilter) {
                    list = list.filter(t => t.price <= Number(maxPriceFilter));
                }
                setTickets(list);
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
    }, [search, sort, maxPriceFilter]);

    const handleClearFilters = () => {
        setSearch('');
        setSort('');
        setMaxPriceFilter('');
    };

    const hasActiveFilters = Boolean(search || sort || maxPriceFilter);

    return (
        <div className="min-h-screen px-4 py-8 sm:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Hero Platform Banner */}
                <div className="relative overflow-hidden p-8 mb-10 border bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800 rounded-3xl shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider uppercase text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full mb-3">
                            <span>🛡️</span> Fan-to-Fan Ethical Resale
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                            Real Fans. Fair Prices. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                                Zero Price Gouging.
                            </span>
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-zinc-400">
                            The safe marketplace built for concert lovers. All tickets are capped at <strong>120% of face value</strong> with official attendee transfer verification.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-6">
                            <Link
                                to="/sell"
                                className="px-5 py-2.5 text-sm font-bold text-white transition-all rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-lg shadow-fuchsia-600/20"
                            >
                                🎫 Sell Extra Ticket
                            </Link>
                            <a
                                href="#catalog"
                                className="px-5 py-2.5 text-sm font-semibold transition-colors border rounded-xl text-zinc-200 border-zinc-700 hover:bg-zinc-800 hover:text-white"
                            >
                                Browse Live Shows ↓
                            </a>
                        </div>
                    </div>
                </div>

                {/* Catalog Controls */}
                <div id="catalog" className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <input
                            type="text"
                            placeholder="🔍 Search by artist, concert, or venue (e.g. Coldplay, Wembley, Mumbai)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`flex-grow ${inputClass}`}
                        />

                        <select
                            value={maxPriceFilter}
                            onChange={(e) => setMaxPriceFilter(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">All Price Ranges</option>
                            <option value="2500">Under ₹2,500</option>
                            <option value="5000">Under ₹5,000</option>
                            <option value="10000">Under ₹10,000</option>
                        </select>

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

                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2.5 text-xs font-semibold text-zinc-400 border rounded-xl border-zinc-800 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="py-20 text-xl text-center text-zinc-400">
                        <span className="inline-block animate-spin text-2xl mb-2">⏳</span>
                        <p>Finding live tickets...</p>
                    </div>
                )}
                
                {error && (
                    <div className="py-10 text-center">
                        <p className="text-xl text-red-400">{error}</p>
                    </div>
                )}
                
                {!loading && !error && tickets.length === 0 && (
                    <div className="py-20 text-center border bg-zinc-900/50 border-zinc-800 rounded-2xl">
                        <div className="text-6xl mb-3">🎫</div>
                        <h2 className="text-2xl font-bold text-white">No tickets match your search</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Try adjusting your search criteria, price filter, or clear filters.
                        </p>
                        <div className="flex justify-center gap-3 mt-6">
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
                                >
                                    Reset All Filters
                                </button>
                            )}
                            <Link
                                to="/sell"
                                className="px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 transition-all"
                            >
                                List the First Ticket
                            </Link>
                        </div>
                    </div>
                )}

                {!loading && !error && tickets.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-4 text-xs text-zinc-400">
                            <span>Showing <strong>{tickets.length}</strong> available ticket listing{tickets.length > 1 ? 's' : ''}</span>
                            <span className="text-emerald-400 font-semibold">✓ 100% Anti-Scalping Verified</span>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {tickets.map(ticket => (
                                <TicketCard
                                    key={ticket._id}
                                    ticket={ticket}
                                    isSaved={wishlistIds.includes(ticket._id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tickets;
