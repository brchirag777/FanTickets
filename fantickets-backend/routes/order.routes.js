const express = require('express');
const router = express.Router();
const { 
    createPaymentOrder, 
    verifyPayment, 
    getMyOrders, 
    getOrderById 
} = require('../controllers/order.controller.js');

const protect = require('../middlewares/auth.middleware.js'); 

router.post('/create-payment-order', protect, createPaymentOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
