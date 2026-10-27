const Order = require('../models/order.model.js');
const Customer = require('../models/customer.model.js');
const Ticket = require('../models/ticket.model.js');
const razorpay = require('../config/razorpay.js');
const crypto = require('crypto'); 


const createPaymentOrder = async (req, res) => {
    try {
        const { attendeeDetails } = req.body;
        const customerId = req.user._id || req.user.id; 

        // Validate Attendee Transfer Details
        if (!attendeeDetails || !attendeeDetails.fullName || !attendeeDetails.email || !attendeeDetails.govIdLast4) {
            return res.status(400).json({ 
                message: "Attendee Transfer Details (Full Name, Email, and Government ID Last 4 Digits) are required." 
            });
        }

        // Validate that attendee full name contains no numbers
        if (/\d/.test(attendeeDetails.fullName) || !/^[a-zA-Z\s.'-]+$/.test(attendeeDetails.fullName.trim())) {
            return res.status(400).json({
                message: "Attendee Full Name must contain only letters (no numbers or special characters allowed)."
            });
        }


        // 1. Fetch user and instantly populate the cart with fresh product data
        const customer = await Customer.findById(customerId).populate('cart.product');

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = [];

        // 2. Strict Server-Side Validation & Snapshot Creation
        for (const item of customer.cart) {
            const product = item.product;

            // Check if product was deleted or if stock ran out while in the cart
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product?.name || 'an item'}.`
                });
            }

            // Self-purchase prevention
            if (product.seller && product.seller.toString() === customerId.toString()) {
                return res.status(400).json({
                    message: `You cannot purchase your own ticket listing (${product.name}). Please remove it from your cart.`
                });
            }

            // Trust ONLY the server price, ignore anything from the frontend
            totalAmount += product.price * item.quantity;

            // Build the unchangeable historical snapshot for the receipt
            orderItems.push({
                ticket: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image
            });
        }

        // 3. Create the Pending ShopKart Order
        const shopKartOrder = new Order({
            user: customerId,
            items: orderItems,
            attendeeDetails: {
                fullName: attendeeDetails.fullName.trim(),
                email: attendeeDetails.email.trim(),
                govIdLast4: attendeeDetails.govIdLast4.trim()
            },
            totalAmount,
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING"
        });
        await shopKartOrder.save();

        // 4. Create the Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), 
            currency: "INR",
            receipt: shopKartOrder._id.toString()
        });

        // Save the Razorpay reference ID into our DB
        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        // 5. Send safe data back to React to launch the payment popup
        res.status(200).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ message: "Failed to create order" });
    }
};

// 1. Verify Payment Signature
const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await Order.findById(shopKartOrderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security Check: Generate our own signature using the secret key
        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Signature is valid! Update the Order
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Decrement ticket stock
        for (const item of order.items) {
            if (item.ticket) {
                await Ticket.findByIdAndUpdate(item.ticket, { $inc: { stock: -item.quantity } });
            }
        }

        // Clear the user's cart ONLY after payment is verified
        const customer = await Customer.findById(req.user._id || req.user.id);
        customer.cart = [];
        await customer.save();

        res.status(200).json({ success: true, orderId: order._id });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};

// 2. Get All Orders for the Logged-in User
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Fetch orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};


// 3. Get a Single Order (Ensuring the user owns it)
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: "Order not found" });
        
        // Prevent users from guessing IDs to view other people's orders
        const userId = req.user._id || req.user.id;
        if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to view this order" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch order details" });
    }
};


module.exports = { 
    createPaymentOrder, 
    verifyPayment, 
    getMyOrders, 
    getOrderById 
};
