import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
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
            await api.post(`/cart/${productId}`);
            await fetchCart(); 
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to add" };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            await api.patch(`/cart/${productId}`, { quantity });
            await fetchCart(); 
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Failed to update" };
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await api.delete(`/cart/${productId}`);
            await fetchCart(); 
        } catch (error) {
            console.error("Failed to remove item");
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const isInCart = (ticketId) => {
        return cart.some(item => {
            const itemTicketId = item.product?._id || item.product || item.ticket?._id || item.ticket;
            return itemTicketId === ticketId;
        });
    };

    const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    const subtotal = cart.reduce((total, item) => {
        const itemObj = item.product || item.ticket;
        if (itemObj && itemObj.price) {
            return total + (itemObj.price * item.quantity);
        }
        return total;
    }, 0);
    
    return (
        <CartContext.Provider value={{ 
            cart, loading, cartCount, subtotal, isInCart,
            addToCart, updateQuantity, removeFromCart, fetchCart, clearCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
