const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0.01, 'Price must be greater than 0']
    },
    image: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    originalFaceValue: {
        type: Number,
        required: true,
        min: [0, 'Original face value cannot be negative']
    }
}, { timestamps: true }); // This automatically handles the createdAt requirement

module.exports = mongoose.model('Ticket', ticketSchema);
