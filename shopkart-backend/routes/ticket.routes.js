const express = require('express');
const router = express.Router();
const { createTicket, getTickets, getTicketById } = require('../controllers/ticket.controller');
const protect = require('../middlewares/auth.middleware.js');

router.post('/', protect, createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);

module.exports = router;
