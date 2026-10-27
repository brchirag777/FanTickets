const Product = require('../models/product.model');
const mongoose = require('mongoose');

// Task 2: Create Product API
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const product = await Product.create({ name, description, price, category, image, stock });
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Task 3 & 5 & Bonus: Get All Products (with Search, Filter, and Sort)
exports.getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let query = {};

        // Search filter (Case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Category filter
        if (category && category !== 'All') {
            query.category = category;
        }

        let mongooseQuery = Product.find(query);

        // Bonus: Sorting logic
        if (sort === 'price_asc') {
            mongooseQuery = mongooseQuery.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            mongooseQuery = mongooseQuery.sort({ price: -1 });
        }

        const products = await mongooseQuery;

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Task 4: Get Single Product API
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the ID is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
