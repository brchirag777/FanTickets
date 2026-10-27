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

        // Anti-scalping rule: Maximum resale price is 120% of original face value
        if (Number(price) > Number(originalFaceValue) * 1.20) {
            return res.status(400).json({ 
                success: false, 
                message: `Anti-scalping rule: Resale price cannot exceed 120% of original face value (₹${(Number(originalFaceValue) * 1.20).toFixed(0)}).` 
            });
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

// Get all tickets (with unified Search covering concert name and venue, and Sort)
exports.getTickets = async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = {};
        if (search && search.trim()) {
            const trimmed = search.trim();
            const words = trimmed.split(/\s+/).filter(Boolean);
            if (words.length > 1) {
                // Multi-word search: each word can match concert name OR venue
                query.$and = words.map(w => {
                    const reg = { $regex: w, $options: 'i' };
                    return {
                        $or: [
                            { name: reg },
                            { venue: reg }
                        ]
                    };
                });
            } else {
                const searchRegex = { $regex: trimmed, $options: 'i' };
                query.$or = [
                    { name: searchRegex },
                    { venue: searchRegex }
                ];
            }
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

// Get listings created by the logged-in user
exports.getMyListings = async (req, res) => {
    try {
        const tickets = await Ticket.find({ seller: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a ticket listing (only allowed if created by the logged-in customer)
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ticket ID format" });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Ownership Check: Only the seller who listed it can delete it
        if (!ticket.seller || ticket.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete ticket listings created by your account."
            });
        }

        await Ticket.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Ticket listing deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a ticket listing (only allowed by the seller who listed it)
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ticket ID format" });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        // Ownership Check
        if (!ticket.seller || ticket.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only edit ticket listings created by your account."
            });
        }

        const { name, price, stock, venue, eventDate, section, originalFaceValue } = req.body;

        const targetFaceValue = originalFaceValue !== undefined ? Number(originalFaceValue) : ticket.originalFaceValue;
        const targetPrice = price !== undefined ? Number(price) : ticket.price;

        // Anti-scalping rule: Resale price cannot exceed 120% of original face value
        if (targetFaceValue > 0 && targetPrice > targetFaceValue * 1.20) {
            return res.status(400).json({
                success: false,
                message: `Anti-scalping rule: Resale price cannot exceed 120% of original face value (₹${(targetFaceValue * 1.20).toFixed(0)}).`
            });
        }

        if (name) ticket.name = name.trim();
        if (price !== undefined) ticket.price = targetPrice;
        if (stock !== undefined) ticket.stock = Number(stock);
        if (venue) ticket.venue = venue.trim();
        if (eventDate) ticket.eventDate = eventDate;
        if (section) ticket.section = section.trim();
        if (originalFaceValue !== undefined) ticket.originalFaceValue = targetFaceValue;

        await ticket.save();

        res.status(200).json({
            success: true,
            message: "Ticket listing updated successfully",
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


