import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const WishList = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await axios.get('http://localhost:5001/wishlist', {
                withCredentials: true 
            });
            setWishlist(response.data.wishlist);
            setLoading(false);
        } catch (err) {
            setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId) => {
        try {
            await axios.delete(`http://localhost:5001/wishlist/${productId}`, {
                withCredentials: true
            });
            setWishlist(wishlist.filter(item => item._id !== productId));
            
            // Shout to the NavBar that an item was removed!
            window.dispatchEvent(new Event('wishlist-updated'));
            
        } catch (err) {
            alert("Failed to remove product");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl text-gray-600">⏳ Loading your wishlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-xl text-red-600">Unable to load wishlist.</p>
                <button onClick={fetchWishlist} className="px-4 py-2 bg-blue-600 text-white rounded">
                    Try Again
                </button>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="text-4xl">❤️</div>
                <h2 className="text-2xl font-bold text-gray-800">Your wishlist is empty</h2>
                <p className="text-gray-600">Save products you love and find them here later.</p>
                <Link to="/products" className="mt-4 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Wishlist ({wishlist.length} items)</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                    <div key={product._id} className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <img src={product.image} alt={product.name} className="object-cover w-full h-48 rounded-md mb-4"/>
                        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                        <p className="text-xl font-extrabold text-blue-600 mt-1">₹{product.price}</p>
                        <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                        
                        <div className="mt-auto flex flex-col gap-2">
                            <Link to={`/products/${product._id}`} className="block w-full py-2 text-center text-white bg-gray-800 rounded hover:bg-gray-900">
                                View Details
                            </Link>
                            <button onClick={() => handleRemove(product._id)} className="block w-full py-2 text-center text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors">
                                Remove ♥
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishList;
