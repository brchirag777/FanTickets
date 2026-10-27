# FanTickets — Verified Fan-to-Fan Concert Ticket Resale Platform

FanTickets is a full-stack MERN application engineered to solve unfair ticket scalping and fraudulent resales. It provides an ethical marketplace where fans can buy and sell concert tickets with an anti-scalping price cap (maximum 120% of face value) and mandatory Attendee Transfer Verification.

---

## 🚀 Key Features

* **Anti-Scalping Guard:** Strict maximum resale cap of 120% of original face value enforced on both client and server.
* **Fair-Trade Pricing Transparency:** Clear visual badges displaying markup or discount percentages (`+X% vs face` or `-X% vs face`) placed directly below seating sections.
* **Attendee Transfer Details:** Replaces physical shipping with verified attendee credentials (Full Name without numbers, Email, and Government ID Last 4 Digits).
* **Digital E-Ticket Passes:** Dynamic QR-coded verifiable digital concert passes generated immediately upon successful order completion.
* **Instant Direct Auth:** Seamless session creation with immediate login upon registration, JWT cookies, and state preservation.
* **Seller Safeguards & Analytics:** Users cannot buy, cart, or wishlist their own ticket listings. Dedicated "My Listings" management hub with live revenue analytics and listing controls.
* **Live Catalog & Search:** Unified search covering concert name, artist, and venue, with price filters and real-time stock protection.
* **Secure Razorpay Checkout:** Cryptographic HMAC SHA-256 server-side signature verification with strict stock validation.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS v4, Context API, Axios, Lucide / Heroicons
* **Backend:** Node.js, Express.js, MongoDB / Mongoose, JWT, Cookie-Parser, CORS
* **Payments:** Razorpay Test API with backend signature verification

---

## 💻 Local Setup Instructions

### 1. Backend Setup (`fantickets-backend`)
1. Navigate to the backend directory:
   ```bash
   cd fantickets-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env` is configured:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup (`fantickets-frontend`)
1. Navigate to the frontend directory:
   ```bash
   cd fantickets-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
