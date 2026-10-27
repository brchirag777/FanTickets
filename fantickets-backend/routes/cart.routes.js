const express = require('express');
const { addToCart, getCart, updateQuantity, removeFromCart } = require('../controllers/cart.controller.js');
const protect = require('../middlewares/auth.middleware.js'); 

const router = express.Router();

router.post('/:productId', protect, addToCart);
router.get('/', protect, getCart);
router.patch('/:productId', protect, updateQuantity);
router.delete('/:productId', protect, removeFromCart);

module.exports = router;
