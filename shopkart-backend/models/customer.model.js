const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address containing an @']
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String, 
        required: true,
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, 'Quantity cannot be less than 1']
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
