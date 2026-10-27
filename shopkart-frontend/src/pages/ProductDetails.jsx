import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext'; // 

const ProductDetails = () => {
    const { id } = useParams(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { addToCart, cart } = useCart();
    const [cartLoading, setCartLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (err) {
                setError('Product not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        setCartLoading(true);
        const result = await addToCart(product._id);
        setCartLoading(false);
        
        if (!result.success) {
            alert(result.message); // Will alert if you exceed stock
        }
    };

    if (loading) return <div className="mt-20 text-xl text-center text-gray-600">Loading product details...</div>;
    if (error) return <div className="mt-20 text-xl text-center text-red-600">{error}</div>;
    if (!product) return null;

    const isInCart = cart.some(item => 
        (item.product._id === product._id) || (item.product === product._id)
    );

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
                <Link to="/products" className="inline-block mb-6 text-blue-600 hover:underline">
                    &larr; Back to Catalog
                </Link>
                
                <div className="flex flex-col gap-8 md:flex-row">
                    <div className="md:w-1/2">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="object-cover w-full h-auto rounded-lg shadow-sm"
                        />
                    </div>
                    
                    <div className="flex flex-col md:w-1/2">
                        <span className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
                            {product.category}
                        </span>
                        <h1 className="mt-2 text-3xl font-bold text-gray-800">{product.name}</h1>
                        <p className="mt-4 text-gray-600">{product.description}</p>
                        <p className="mt-6 text-4xl font-extrabold text-blue-600">₹{product.price}</p>
                        <p className="mt-2 text-gray-600">{product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</p>
                        
                        <button 
                            onClick={handleAddToCart}
                            disabled={cartLoading || product.stock < 1}
                            className={`w-full py-3 mt-8 text-lg font-bold text-white transition-colors rounded-lg ${
                                product.stock < 1 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : (isInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')
                            }`}
                        >
                            {cartLoading ? '⏳ Adding...' : (
                                product.stock < 1 ? 'Out of Stock' : (isInCart ? '➕ Add Another (+1)' : '🛒 Add to Cart')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
