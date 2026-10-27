const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } = require('../controllers/wishlist.controller.js');
const protect = require('../middlewares/auth.middleware.js'); 

const router = express.Router();

router.post('/:productId', protect, addToWishlist);
router.get('/', protect, getWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.patch('/:productId/toggle', protect, toggleWishlist);

module.exports = router;
