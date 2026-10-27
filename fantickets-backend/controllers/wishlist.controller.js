const Customer = require('../models/customer.model.js');
const Ticket = require('../models/ticket.model.js');

// 1. ADD TO WISHLIST 
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params; 
        const customerId = req.user._id; 

        const productExists = await Ticket.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Seller check: Prevent seller from adding their own ticket listing to wishlist
        if (productExists.seller && productExists.seller.toString() === customerId.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot add your own ticket listing to wishlist." 
            });
        }

        // Stock check: Cannot wishlist sold out tickets
        if ((productExists.stock ?? 0) < 1) {
            return res.status(400).json({ 
                success: false, 
                message: "Sold out tickets cannot be added to wishlist." 
            });
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
        const customerId = req.user._id;

        const ticket = await Ticket.findById(productId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Seller check
        if (ticket.seller && ticket.seller.toString() === customerId.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot save your own ticket listing to wishlist." 
            });
        }

        const customer = await Customer.findById(customerId);

        const isSaved = customer.wishlist.some(id => id.toString() === productId);

        if (isSaved) {
            customer.wishlist.pull(productId);
            await customer.save();
            return res.status(200).json({ success: true, saved: false, message: "Removed from wishlist" });
        } else {
            // Cannot add sold out tickets to wishlist
            if ((ticket.stock ?? 0) < 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Sold out tickets cannot be added to wishlist." 
                });
            }

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
