import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Checkout = () => {
    const { cart, subtotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

        // Strict Client-Side Form Validation
        const phoneRegex = /^[0-9]{10}$/;
        const pinRegex = /^[0-9]{6}$/;

        if (!formData.fullName.trim() || !formData.addressLine1.trim() || !formData.city.trim() || !formData.state.trim()) {
            return setError("All fields are required and cannot be empty.");
        }
        if (!phoneRegex.test(formData.phone.trim())) {
            return setError("Phone number must be exactly 10 digits.");
        }
        if (!pinRegex.test(formData.pincode.trim())) {
            return setError("Pincode must be exactly 6 digits.");
        }

        setLoading(true);

        try {
            // Call our backend to create the pending order & Razorpay order
            const orderRes = await axios.post('http://localhost:5001/orders/create-payment-order', {
                shippingAddress: formData
            }, { withCredentials: true });

            const orderData = orderRes.data;

            // Load the Razorpay Checkout Window
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setLoading(false);
                return setError("Failed to load Razorpay SDK. Check your connection.");
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ShopKart",
                description: "Test Transaction",
                order_id: orderData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // Verify Payment Signature on our backend
                        const verifyRes = await axios.post('http://localhost:5001/orders/verify-payment', {
                            shopKartOrderId: orderData.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, { withCredentials: true });

                        if (verifyRes.data.success) {
                            clearCart(); // Wipe the global cart instantly
                            navigate('/orders'); // Send them to the success/history page
                        }
                    } catch (err) {
                        alert("Payment verification failed! Your cart is safe. Please contact support.");
                    }
                },
                prefill: {
                    name: formData.fullName,
                    contact: formData.phone
                },
                theme: { color: "#2563eb" } // Matches our blue theme
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                alert("Payment failed or cancelled! Please try again.");
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
            <div className="flex flex-col items-center justify-center h-64 gap-4 mt-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <button onClick={() => navigate('/products')} className="px-6 py-2 mt-4 text-white transition-colors bg-gray-800 rounded hover:bg-gray-900">
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl p-4 mx-auto mt-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-800">Checkout</h1>
            
            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex-grow p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="mb-6 text-xl font-bold text-gray-800">Shipping Details</h2>
                    {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
                    
                    <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
                        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full p-3 border rounded" />
                        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} maxLength="10" className="w-full p-3 border rounded" />
                        <input type="text" name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1} onChange={handleChange} className="w-full p-3 border rounded" />
                        
                        <div className="flex gap-4">
                            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-3 border rounded" />
                            <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full p-3 border rounded" />
                        </div>
                        <input type="text" name="pincode" placeholder="6-Digit Pincode" value={formData.pincode} onChange={handleChange} maxLength="6" className="w-full p-3 border rounded" />

                        <button type="submit" disabled={loading} className="w-full py-3 mt-4 font-bold text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                            {loading ? 'Processing...' : 'Pay with Razorpay'}
                        </button>
                    </form>
                </div>

                <div className="w-full h-fit lg:w-1/3 sticky top-6">
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Order Summary</h2>
                        <div className="flex flex-col gap-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.product._id} className="flex justify-between text-gray-600">
                                    <span>{item.product.name} <span className="font-semibold text-gray-800">x {item.quantity}</span></span>
                                    <span>₹{item.product.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between pt-4 text-xl font-bold text-gray-800 border-t">
                            <span>Total:</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
