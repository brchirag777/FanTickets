import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5001/orders', { withCredentials: true });
                setOrders(response.data.orders);
            } catch (err) {
                setError('Failed to load your orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="mt-20 text-xl text-center text-gray-600">⏳ Loading your orders...</div>;
    }

    if (error) {
        return <div className="mt-20 text-xl text-center text-red-600">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 mt-10 text-center">
                <div className="text-5xl">📦</div>
                <h2 className="text-2xl font-bold text-gray-800">No orders found</h2>
                <p className="text-gray-600">You haven't placed any orders yet.</p>
                <Link to="/products" className="px-6 py-2 mt-4 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl p-4 mx-auto mt-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-800">My Orders</h1>
            
            <div className="flex flex-col gap-6">
                {orders.map((order) => (
                    <div key={order._id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex flex-col justify-between pb-4 mb-4 border-b md:flex-row md:items-center">
                            <div>
                                <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-gray-800">{order._id}</span></p>
                                <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-2 text-left md:mt-0 md:text-right">
                                <span className={`px-3 py-1 text-xs font-bold tracking-wider text-white uppercase rounded-full ${
                                    order.status === 'PLACED' ? 'bg-green-500' : 'bg-blue-500'
                                }`}>
                                    {order.status}
                                </span>
                                <p className="mt-2 text-xl font-bold text-gray-800">Total: ₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-gray-700">
                                    <div className="flex items-center gap-4">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="object-cover w-12 h-12 rounded" />
                                        )}
                                        <span className="font-medium">{item.name} <span className="text-gray-500">x {item.quantity}</span></span>
                                    </div>
                                    <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
