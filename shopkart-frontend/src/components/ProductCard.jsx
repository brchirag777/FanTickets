import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isSaved }) => {
    const [saved, setSaved] = useState(isSaved);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    
    // 🌟 Grab the 'cart' array to check if the product is already in it
    const { addToCart, cart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);

    // Check if this specific product is already in the global cart
    const isInCart = cart.some(item => 
        (item.product._id === product._id) || (item.product === product._id)
    );

    useEffect(() => {
        setSaved(isSaved);
    }, [isSaved]);

    const handleToggleWishlist = async () => {
        setWishlistLoading(true);
        try {
            const response = await axios.patch(
                `http://localhost:5001/wishlist/${product._id}/toggle`, 
                {}, 
                { withCredentials: true }
            );
            setSaved(response.data.saved);
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch (error) {
            alert('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setCartLoading(true);
        const result = await addToCart(product._id);
        setCartLoading(false);
        
        if (!result.success) {
            alert(result.message); 
        }
    };

    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <img 
                src={product.image} 
                alt={product.name} 
                className="object-cover w-full h-48 rounded-t-lg"
            />
            <div className="flex flex-col flex-grow p-4">
                <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
                    {product.category}
                </span>
                <h3 className="mt-1 text-lg font-bold text-gray-800">{product.name}</h3>
                <p className="mt-2 text-xl font-extrabold text-blue-600">₹{product.price}</p>
                <p className="mt-1 text-sm text-gray-600">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                
                <div className="mt-auto pt-4 flex flex-col gap-2">
                    <Link 
                        to={`/products/${product._id}`}
                        className="block w-full py-2 text-center text-white bg-gray-800 rounded hover:bg-gray-900"
                    >
                        View Details
                    </Link>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={cartLoading || product.stock < 1}
                        className={`w-full py-2 text-center border rounded font-medium transition-colors ${
                            product.stock < 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                : (isInCart ? 'bg-green-600 text-white hover:bg-green-700 border-green-600' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700')
                        }`}
                    >
                        {/* 🌟 The text now dynamically changes if it's already in the cart */}
                        {cartLoading ? '⏳ Adding...' : (
                            product.stock < 1 ? 'Out of Stock' : (isInCart ? '➕ Add Another (+1)' : '🛒 Add to Cart')
                        )}
                    </button>

                    <button 
                        onClick={handleToggleWishlist}
                        disabled={wishlistLoading}
                        className={`w-full py-2 text-center border rounded font-medium transition-colors ${
                            saved 
                                ? 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'    
                        }`}
                    >
                        {wishlistLoading ? '⏳ Updating...' : (saved ? '♥ Remove' : '♡ Save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
