import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]); // 🌟 NEW: Track saved IDs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter States
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('');

    // 🌟 NEW: Fetch Wishlist IDs on mount
    useEffect(() => {
        const fetchWishlistIds = async () => {
            try {
                const response = await api.get('/wishlist');
                // Map the populated products back to just their IDs for easy checking
                const ids = response.data.wishlist.map(item => item._id);
                setWishlistIds(ids);
            } catch (err) {
                console.error("Failed to load wishlist IDs");
            }
        };
        fetchWishlistIds();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (category !== 'All') params.append('category', category);
                if (sort) params.append('sort', sort);

                const response = await api.get(`/products?${params.toString()}`);
                setProducts(response.data.products);
            } catch (err) {
                setError('Something went wrong while loading products.');
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, category, sort]);

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">ShopKart Catalog</h1>
                
                <div className="flex flex-col gap-4 mb-8 md:flex-row">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded focus:outline-blue-500"
                    />
                    
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="p-3 bg-white border border-gray-300 rounded focus:outline-blue-500"
                    >
                        <option value="All">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Books">Books</option>
                    </select>

                    <select 
                        value={sort} 
                        onChange={(e) => setSort(e.target.value)}
                        className="p-3 bg-white border border-gray-300 rounded focus:outline-blue-500"
                    >
                        <option value="">Sort By</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>

                {loading && <div className="text-xl text-center text-gray-600 py-10">Loading products...</div>}
                {error && <div className="text-xl text-center text-red-600 py-10">{error}</div>}
                {!loading && !error && products.length === 0 && (
                    <div className="text-xl text-center text-gray-600 py-10">No products found.</div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {products.map(product => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                isSaved={wishlistIds.includes(product._id)} /* 🌟 NEW: Pass down true/false */
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
