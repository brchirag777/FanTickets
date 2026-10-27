const wishlistRoutes = require('./routes/wishlist.routes.js');
const cartRoutes = require('./routes/cart.routes.js');
const orderRoutes = require('./routes/order.routes');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
// 1. Import Routes
const customerRoutes = require('./routes/customer.routes');
const ticketRoutes = require('./routes/ticket.routes');
// 2. Initialize App
const app = express();
// 3. Global Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
// 4. Mount Routes 
app.use('/customers', customerRoutes);
app.use('/tickets', ticketRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/orders', orderRoutes);
// 5. Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => console.log('❌ DB connection error:', err));
