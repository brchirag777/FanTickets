const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer", 
            required: true
        },
        items: [
            {
                ticket: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Ticket",
                    required: true
                },
                // Hardcoded so they never change even if the main product does
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                image: { type: String }
            }
        ],
        attendeeDetails: {
            fullName: { type: String, required: true },
            email: { type: String, required: true },
            govIdLast4: { type: String, required: true }
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING"
        },
        status: {
            type: String,
            enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
            default: "PENDING_PAYMENT"
        },
        // Razorpay Tracking
        razorpayOrderId: String,
        razorpayPaymentId: String
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
