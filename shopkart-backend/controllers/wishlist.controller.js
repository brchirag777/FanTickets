const Customer = require('../models/customer.model.js');
const Product = require('../models/product.model.js');

// 1. ADD TO WISHLIST 
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params; 
        const customerId = req.user._id; 

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(customerId);

        if (customer.wishlist.includes(productId)) {
            return res.status(409).json({ success: false, message: "Product already in wishlist" });
        }

        customer.wishlist.push(productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Product added to wishlist" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. GET WISHLIST 
const getWishlist = async (req, res) => {
    try {
        const customerId = req.user._id; 
        const customer = await Customer.findById(customerId).populate('wishlist');

        res.status(200).json({ 
            success: true, 
            count: customer.wishlist.length,
            wishlist: customer.wishlist 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 3. REMOVE FROM WISHLIST 
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id; 

        const customer = await Customer.findById(customerId);

        if (!customer.wishlist.includes(productId)) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        customer.wishlist.pull(productId);
        await customer.save();

        res.status(200).json({ success: true, message: "Product removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 4. TOGGLE WISHLIST (BONUS)
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const customer = await Customer.findById(req.user._id);

        const isSaved = customer.wishlist.some(id => id.toString() === productId);

        if (isSaved) {
            customer.wishlist.pull(productId);
            await customer.save();
            return res.status(200).json({ success: true, saved: false, message: "Removed from wishlist" });
        } else {
            customer.wishlist.push(productId);
            await customer.save();
            return res.status(200).json({ success: true, saved: true, message: "Added to wishlist" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist
};
