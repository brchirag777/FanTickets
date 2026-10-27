const express = require('express');
const router = express.Router();
const { 
    createTicket, 
    getTickets, 
    getTicketById, 
    getMyListings, 
    deleteTicket,
    updateTicket
} = require('../controllers/ticket.controller');
const protect = require('../middlewares/auth.middleware.js');

router.post('/', protect, createTicket);
router.get('/', getTickets);
router.get('/my/listings', protect, getMyListings);
router.get('/:id', getTicketById);
router.patch('/:id', protect, updateTicket);
router.delete('/:id', protect, deleteTicket);

module.exports = router;

