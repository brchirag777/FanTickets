const Ticket = require('../models/ticket.model');
const mongoose = require('mongoose');
// Create a ticket listing (seller is the logged-in customer)
exports.createTicket = async (req, res) => {
    try {
        const { name, price, image, stock, venue, eventDate, section, originalFaceValue } = req.body;
        if (!name || price === undefined || stock === undefined ||
            !venue || !eventDate || !section || originalFaceValue === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        const ticket = await Ticket.create({
            name, price, image: image || '', stock, venue, eventDate, section, originalFaceValue,
            seller: req.user._id
        });
        res.status(201).json({ success: true, ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// Get all tickets (with Search, Venue filter, and Sort)
exports.getTickets = async (req, res) => {
    try {
        const { search, venue, sort } = req.query;
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (venue && venue !== 'All') {
            query.venue = { $regex: venue, $options: 'i' };
        }
        let mongooseQuery = Ticket.find(query).populate('seller', 'fullName');
        if (sort === 'price_asc') {
            mongooseQuery = mongooseQuery.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            mongooseQuery = mongooseQuery.sort({ price: -1 });
        } else if (sort === 'date_asc') {
            mongooseQuery = mongooseQuery.sort({ eventDate: 1 });
        }
        const tickets = await mongooseQuery;
        res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get single ticket
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ticket ID format" });
        }
        const ticket = await Ticket.findById(id).populate('seller', 'fullName');
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        res.status(200).json({ success: true, ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
