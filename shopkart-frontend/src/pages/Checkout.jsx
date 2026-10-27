import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import axios from 'axios';

const inputClass =
    "w-full p-3 text-white bg-zinc-950 border border-zinc-700 rounded-lg placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500";
const labelClass = "block mb-1 text-sm font-medium text-zinc-300";

const Checkout = () => {
    const { cart, subtotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        govIdLast4: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullName') {
            // Strip any numeric characters so numbers cannot be typed or pasted
            const sanitizedValue = value.replace(/[0-9]/g, '');
            if (sanitizedValue !== value) {
                setError("Numbers are not allowed in the Attendee Name field.");
            } else if (error === "Numbers are not allowed in the Attendee Name field.") {
                setError('');
            }
            return setFormData({ ...formData, [name]: sanitizedValue });
        }
        setFormData({ ...formData, [name]: value });
    };

    // Helper to dynamically load the Razorpay SDK script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');

        // Strict Client-Side Validation for Attendee Transfer Details
        const nameRegex = /^[a-zA-Z\s.'-]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const idRegex = /^[0-9]{4}$/;

        const trimmedName = formData.fullName.trim();
        if (!trimmedName) {
            return setError("Attendee full name is required.");
        }
        if (/\d/.test(trimmedName)) {
            return setError("Attendee full name cannot contain numbers.");
        }
        if (!nameRegex.test(trimmedName) || trimmedName.length < 2) {
            return setError("Attendee full name must contain only letters (no numbers or special characters).");
        }
        if (!emailRegex.test(formData.email.trim())) {
            return setError("Please provide a valid email address for digital ticket delivery.");
        }
        if (!idRegex.test(formData.govIdLast4.trim())) {
            return setError("Government ID last 4 digits must be exactly 4 numerical digits.");
        }


        setLoading(true);

        try {
            // Call our backend to create the pending order & Razorpay order
            const orderRes = await axios.post('http://localhost:5001/orders/create-payment-order', {
                attendeeDetails: {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    govIdLast4: formData.govIdLast4.trim()
                }
            }, { withCredentials: true });

            const orderData = orderRes.data;

            // Load the Razorpay Checkout Window
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setLoading(false);
                return setError("Failed to load Razorpay payment gateway. Please check your internet connection.");
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "FanTickets",
                description: "Digital Concert Ticket Transfer",
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // Verify Payment Signature on backend
                        const verifyRes = await axios.post('http://localhost:5001/orders/verify-payment', {
                            shopKartOrderId: orderData.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { withCredentials: true });

                        if (verifyRes.data.success) {
                            clearCart();
                            navigate('/orders');
                        }
                    } catch (err) {
                        alert("Payment verification failed! Please contact support.");
                    }
                },
                prefill: {
                    name: formData.fullName,
                    email: formData.email
                },
                theme: { color: "#d946ef" } // Fuchsia concert accent
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function () {
                alert("Payment was cancelled or failed. Please try again.");
            });
            paymentObject.open();

        } catch (err) {
            setError(err.response?.data?.message || "Failed to initiate checkout.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 px-4 mt-10 text-center">
                <div className="text-5xl">🎫</div>
                <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
                <p className="text-zinc-400">Choose tickets to your favorite concert before checking out.</p>
                <Link to="/tickets" className="px-6 py-2 mt-4 text-white transition-colors rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500">
                    Browse Tickets
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl p-4 mx-auto mt-8">
            <h1 className="mb-2 text-3xl font-extrabold text-white">Checkout</h1>
            <p className="mb-8 text-zinc-400">Complete attendee transfer details for your digital concert tickets.</p>

            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex-grow p-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🎟️</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">Attendee Transfer Details</h2>
                            <p className="text-xs text-zinc-400">Digital tickets will be officially transferred and matched against this attendee ID at venue gates.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 text-sm text-red-300 border rounded-lg bg-red-500/10 border-red-500/30">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="fullName" className={labelClass}>Attendee Full Name (As per Govt ID)</label>
                            <input 
                                id="fullName"
                                type="text" 
                                name="fullName" 
                                placeholder="e.g. Rahul Sharma" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>Transfer Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                name="email" 
                                placeholder="e.g. rahul@example.com (Ticket will be transferred here)" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className={inputClass} 
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="govIdLast4" className={labelClass}>Government ID Last 4 Digits</label>
                            <input 
                                id="govIdLast4"
                                type="text" 
                                name="govIdLast4" 
                                placeholder="Last 4 digits of Aadhaar, Passport, or Voter ID" 
                                value={formData.govIdLast4} 
                                onChange={handleChange} 
                                maxLength="4" 
                                className={inputClass} 
                                required
                            />
                            <p className="mt-1 text-xs text-zinc-500">Required for fan identity verification at stadium entry gates.</p>
                        </div>

                        <div className="p-4 mt-2 border rounded-lg bg-zinc-950/60 border-zinc-800">
                            <p className="text-xs text-zinc-400">
                                🔒 <strong>Safe Fan Transfer:</strong> Digital tickets are delivered directly upon confirmed payment. Physical shipping is not required.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3 mt-4 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing Transfer...' : `Proceed to Pay ${formatPrice(subtotal)}`}
                        </button>
                    </form>
                </div>

                <div className="sticky w-full h-fit lg:w-1/3 top-6">
                    <div className="p-6 border bg-zinc-900 border-zinc-800 rounded-xl shadow-lg">
                        <h2 className="mb-4 text-xl font-bold text-white">Order Summary</h2>
                        <div className="flex flex-col gap-4 mb-6">
                            {cart.map((item) => {
                                const ticket = item.product || item.ticket;
                                if (!ticket) return null;
                                return (
                                    <div key={ticket._id} className="flex justify-between text-sm text-zinc-300">
                                        <div className="pr-2">
                                            <p className="font-semibold text-white">{ticket.name}</p>
                                            <p className="text-xs text-zinc-500">Sec {ticket.section} · Qty {item.quantity}</p>
                                        </div>
                                        <span className="font-bold text-fuchsia-400 shrink-0">
                                            {formatPrice(ticket.price * item.quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between pt-4 text-xl font-bold text-white border-t border-zinc-800">
                            <span>Total Amount:</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
