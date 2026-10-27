import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../utils/format';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activePass, setActivePass] = useState(null); // Selected item for digital pass

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5001/orders', { withCredentials: true });
                setOrders(response.data.orders || []);
            } catch (err) {
                setError('Failed to load your orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-xl text-zinc-400">⏳ Loading your ticket orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md px-4 py-16 mx-auto text-center">
                <div className="p-8 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <p className="text-lg text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 px-4 mt-10 text-center">
                <div className="text-5xl">🎟️</div>
                <h2 className="text-2xl font-bold text-white">No tickets ordered yet</h2>
                <p className="text-zinc-400">You haven't purchased any concert tickets yet.</p>
                <Link to="/tickets" className="px-6 py-2.5 mt-4 font-semibold text-white transition-colors rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500">
                    Find Shows &amp; Tickets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl p-4 mx-auto mt-8">
            <h1 className="mb-2 text-3xl font-extrabold text-white">My Ticket Orders</h1>
            <p className="mb-8 text-zinc-400">Digital tickets purchased through FanTickets with verified attendee transfers.</p>
            
            <div className="flex flex-col gap-6">
                {orders.map((order) => (
                    <div key={order._id} className="p-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                        <div className="flex flex-col justify-between pb-4 mb-4 border-b border-zinc-800 md:flex-row md:items-center">
                            <div>
                                <p className="text-xs text-zinc-400">
                                    Order ID: <span className="font-mono text-zinc-300">{order._id}</span>
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Placed on: <span className="text-zinc-200">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </p>
                                {order.attendeeDetails?.fullName && (
                                    <p className="mt-1 text-xs text-fuchsia-400">
                                        Attendee: <span className="font-semibold text-white">{order.attendeeDetails.fullName}</span> ({order.attendeeDetails.email}) · ID Last 4: <span className="font-mono text-white">**{order.attendeeDetails.govIdLast4}</span>
                                    </p>
                                )}
                            </div>
                            <div className="mt-3 text-left md:mt-0 md:text-right">
                                <span className={`px-2.5 py-1 text-xs font-bold tracking-wider uppercase rounded-full ${
                                    order.paymentStatus === 'PAID' || order.status === 'PLACED' 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                    {order.paymentStatus === 'PAID' ? 'CONFIRMED' : order.status}
                                </span>
                                <p className="mt-2 text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                                    {formatPrice(order.totalAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex flex-col justify-between p-4 border rounded-xl bg-zinc-950/60 border-zinc-800 sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="object-cover w-14 h-14 rounded-lg" />
                                        ) : (
                                            <div className="flex items-center justify-center w-14 h-14 text-2xl rounded-lg bg-zinc-800">
                                                🎫
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-white text-base">{item.name}</p>
                                            <p className="text-xs text-zinc-400">Quantity: {item.quantity} ticket{item.quantity > 1 ? 's' : ''}</p>
                                            <p className="text-xs text-fuchsia-400 font-medium">Digital Transfer Confirmed</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                        <span className="font-bold text-white text-base">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                        <button
                                            onClick={() => setActivePass({ item, order })}
                                            className="px-4 py-2 text-xs font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 shadow-md shadow-fuchsia-600/20"
                                        >
                                            🎫 View E-Ticket Pass
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Digital Concert E-Ticket Pass Modal */}
            {activePass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md overflow-hidden border bg-zinc-900 border-zinc-700 rounded-3xl shadow-2xl">
                        {/* Header gradient banner */}
                        <div className="p-6 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 text-white relative">
                            <button
                                onClick={() => setActivePass(null)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold"
                            >
                                ✕
                            </button>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-fuchsia-200">
                                <span>🎸</span> Official FanTickets Pass
                            </div>
                            <h2 className="mt-2 text-2xl font-black">{activePass.item.name}</h2>
                            <p className="text-xs text-purple-100 mt-1">Verified Fan-to-Fan Admission</p>
                        </div>

                        {/* Ticket Perforation effect */}
                        <div className="relative flex items-center justify-between px-4 py-1 bg-zinc-900">
                            <div className="w-6 h-6 -ml-7 bg-black rounded-full" />
                            <div className="w-full border-t-2 border-dashed border-zinc-700 mx-2" />
                            <div className="w-6 h-6 -mr-7 bg-black rounded-full" />
                        </div>

                        {/* Ticket Details Body */}
                        <div className="p-6 space-y-4 text-sm text-zinc-300">
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-semibold">Attendee Name</p>
                                    <p className="font-bold text-white text-base">
                                        {activePass.order.attendeeDetails?.fullName || 'Verified Attendee'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-semibold">Govt ID Verification</p>
                                    <p className="font-mono font-bold text-white text-base">
                                        **{activePass.order.attendeeDetails?.govIdLast4 || 'XXXX'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-semibold">Quantity</p>
                                    <p className="font-bold text-white">{activePass.item.quantity} Digital Pass(es)</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-semibold">Transfer Status</p>
                                    <span className="inline-block px-2 py-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                        ✓ COMPLETED
                                    </span>
                                </div>
                            </div>

                            {/* Simulated Digital Security QR & Barcode */}
                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-black text-center">
                                <div className="text-xs font-bold tracking-wider uppercase text-zinc-500 mb-2">
                                    Scan at Venue Entry Gate
                                </div>
                                {/* SVG Simulated QR Code */}
                                <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
                                    <rect x="0" y="0" width="30" height="30" rx="3" fill="#000" />
                                    <rect x="5" y="5" width="20" height="20" fill="#fff" />
                                    <rect x="9" y="9" width="12" height="12" fill="#000" />

                                    <rect x="70" y="0" width="30" height="30" rx="3" fill="#000" />
                                    <rect x="75" y="5" width="20" height="20" fill="#fff" />
                                    <rect x="79" y="9" width="12" height="12" fill="#000" />

                                    <rect x="0" y="70" width="30" height="30" rx="3" fill="#000" />
                                    <rect x="5" y="75" width="20" height="20" fill="#fff" />
                                    <rect x="9" y="79" width="12" height="12" fill="#000" />

                                    {/* Data pattern dots */}
                                    <rect x="36" y="10" width="8" height="8" fill="#000" />
                                    <rect x="48" y="10" width="12" height="8" fill="#000" />
                                    <rect x="36" y="24" width="24" height="6" fill="#000" />
                                    <rect x="10" y="38" width="16" height="8" fill="#000" />
                                    <rect x="36" y="38" width="10" height="10" fill="#000" />
                                    <rect x="54" y="38" width="18" height="8" fill="#000" />
                                    <rect x="80" y="38" width="12" height="12" fill="#000" />
                                    <rect x="38" y="56" width="24" height="8" fill="#000" />
                                    <rect x="70" y="56" width="10" height="16" fill="#000" />
                                    <rect x="38" y="72" width="16" height="18" fill="#000" />
                                    <rect x="62" y="78" width="28" height="12" fill="#000" />
                                </svg>
                                <p className="font-mono text-xs font-bold tracking-widest mt-2 text-zinc-700">
                                    FT-{activePass.order._id.slice(-8).toUpperCase()}
                                </p>
                            </div>

                            <p className="text-center text-xs text-zinc-500">
                                Present this digital pass along with Government Photo ID at the gate.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 py-2.5 font-bold text-center text-white transition-colors border rounded-xl bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                                >
                                    🖨️ Print / Save Pass
                                </button>
                                <button
                                    onClick={() => setActivePass(null)}
                                    className="px-5 py-2.5 font-semibold text-zinc-300 transition-colors border rounded-xl border-zinc-800 hover:bg-zinc-800"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
