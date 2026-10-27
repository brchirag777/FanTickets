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

// Trust reverse proxy (essential for secure cookies on Render / Heroku / Cloudflare)
app.set('trust proxy', 1);

// 3. Global Middlewares
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fantickets-frontend.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, server-to-server, mobile)
        if (!origin) return callback(null, true);
        if (
            process.env.NODE_ENV !== 'production' ||
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.netlify.app') ||
            origin.endsWith('.onrender.com')
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Root & Health check
app.get('/', (req, res) => {
    res.status(200).send('FanTickets API is running smoothly.');
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'fantickets-backend' });
});

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
