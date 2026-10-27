import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    // Instantly grab everything we need from our global Context bubble
    const { cart, loading, cartCount, subtotal, updateQuantity, removeFromCart } = useCart();

    // 1. Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl text-gray-600">⏳ Loading your cart...</p>
            </div>
        );
    }

    // 2. Empty State
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 mt-10 text-center">
                <div className="text-5xl">🛒</div>
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="text-gray-600">Looks like you haven't added anything yet.</p>
                <Link to="/products" className="px-6 py-2 mt-4 text-white transition-colors bg-gray-800 rounded hover:bg-gray-900">
                    Browse Products
                </Link>
            </div>
        );
    }

    // 3. Populated Cart State
    return (
        <div className="max-w-6xl p-4 mx-auto mt-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-800">My Cart</h1>
            
            <div className="flex flex-col gap-8 lg:flex-row">
                
                <div className="flex flex-col flex-grow gap-4">
                    {cart.map((item) => {
                        const product = item.product;
                        // Safety check in case a product is deleted from the database
                        if (!product) return null; 

                        return (
                            <div key={product._id} className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row gap-6">
                                <img src={product.image} alt={product.name} className="object-cover w-24 h-24 rounded-md sm:w-32 sm:h-32" />
                                
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                                    <p className="mt-1 text-lg font-extrabold text-blue-600">₹{product.price}</p>
                                    <p className="mt-1 text-sm text-gray-500">{product.stock} left in stock</p>
                                </div>
                                
                                <div className="flex flex-col items-center gap-4 sm:items-end">
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button 
                                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="px-3 py-1 transition-colors bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 px-4 font-semibold text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                            disabled={item.quantity >= product.stock}
                                            className="px-3 py-1 transition-colors bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => removeFromCart(product._id)}
                                        className="text-sm font-medium text-red-600 transition-colors hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm lg:w-1/3 h-fit sticky top-6">
                    <h2 className="mb-6 text-2xl font-bold text-gray-800">Order Summary</h2>
                    <div className="flex justify-between mb-4 text-gray-600">
                        <span>Items in Cart:</span>
                        <span className="font-medium">{cartCount}</span>
                    </div>
                    <div className="flex justify-between pt-4 mb-6 text-xl font-bold text-gray-800 border-t">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <Link 
                        to="/checkout" 
                        className="block w-full py-3 font-bold text-center text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                    >
                        Proceed to Checkout
                    </Link>

                </div>
                
            </div>
        </div>
    );
};

export default Cart;
