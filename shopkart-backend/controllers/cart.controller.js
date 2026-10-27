const Customer = require('../models/customer.model.js');
const Product = require('../models/product.model.js');

// 1. ADD TO CART
const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const customer = await Customer.findById(customerId);
        
        // Find if the product already exists in the cart array
        const cartItem = customer.cart.find(item => item.product.toString() === productId);

        if (cartItem) {
            // Rule: If already present, increase existing quantity by 1
            if (cartItem.quantity + 1 > product.stock) {
                return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
            }
            cartItem.quantity += 1;
        } else {
            // Rule: If not present, add with quantity 1
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is out of stock" });
            }
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();
        res.status(200).json({ success: true, message: "Cart updated", cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. GET CART
const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate('cart.product');
        res.status(200).json({ success: true, cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. UPDATE QUANTITY
const updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const customerId = req.user._id;

        if (quantity < 1) return res.status(400).json({ success: false, message: "Quantity must be at least 1" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
        }

        const customer = await Customer.findById(customerId);
        const cartItem = customer.cart.find(item => item.product.toString() === productId);

        if (!cartItem) return res.status(404).json({ success: false, message: "Product not in cart" });

        cartItem.quantity = quantity;
        await customer.save();

        res.status(200).json({ success: true, message: "Quantity updated", cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 4. REMOVE FROM CART
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customer = await Customer.findById(req.user._id);

        // Filter out the item to remove it
        customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Removed from cart", cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };
