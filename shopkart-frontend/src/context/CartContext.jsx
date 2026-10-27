import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const response = await axios.get('http://localhost:5001/cart', { withCredentials: true });
            setCart(response.data.cart || []);
        } catch (error) {
            console.error("Failed to fetch cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (productId) => {
        try {
            await axios.post(`http://localhost:5001/cart/${productId}`, {}, { withCredentials: true });
            await fetchCart(); 
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to add" };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            await axios.patch(`http://localhost:5001/cart/${productId}`, { quantity }, { withCredentials: true });
            await fetchCart(); 
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to update" };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await axios.delete(`http://localhost:5001/cart/${productId}`, { withCredentials: true });
            await fetchCart(); 
        } catch (error) {
            console.error("Failed to remove item");
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => {
        if (item.product && item.product.price) {
            return total + (item.product.price * item.quantity);
        }
        return total;
    }, 0);
    
    return (
        <CartContext.Provider value={{ 
            cart, loading, cartCount, subtotal, 
            addToCart, updateQuantity, removeFromCart, fetchCart, clearCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
