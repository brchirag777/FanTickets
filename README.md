# FanTickets - Peer-to-Peer Concert Ticket Exchange

FanTickets is a full-stack MERN application built as an end-term project to solve the complexities and price gouging (scalping) associated with third-party ticket reselling. 

It provides a secure, fan-to-fan escrow marketplace that strictly caps resale prices at 120% of the original face value and prevents sellers from purchasing their own inventory.

## Live Deployment Links
* **Frontend (Vercel):** [https://fantickets-frontend.vercel.app](https://fantickets-frontend.vercel.app)
* **Backend API (Render):** [https://fantickets.onrender.com](https://fantickets.onrender.com)
* **Demo Video:** [https://drive.google.com/file/d/1sbC8FENJHdaLetJpnK4rgqz1yeA4m9K_/view?usp=sharing]



## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS (Dark-mode concert theme), Context API (Global Cart State)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose
* **Payments & Verification:** Razorpay Test API
* **Security & Auth:** JWT (JSON Web Tokens), bcrypt, HMAC SHA-256 Cryptographic Signatures

## Core Features & Business Logic
* **Anti-Scalping Guardrails:** Backend API automatically rejects any ticket listing where the asking price exceeds `originalFaceValue * 1.20`.
* **Self-Purchase Prevention:** Logic prevents a logged-in user from adding their own listed tickets to their cart.
* **Strict Stock Validation:** Server-side checks ensure a buyer cannot request a quantity that exceeds the available ticket stock.
* **Escrow Checkout:** Collects Attendee Transfer Details (Name, Email, ID digits) before securely calculating the final total on the server and initiating the Razorpay flow.
* **Historical Order Snapshots:** Finalized orders permanently snapshot the ticket data to prevent historical receipt tampering.

## Local Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory: `cd fantickets-backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the backend root with the following variables:

```env
PORT=5001 
MONGO_URI=your_mongodb_connection_string 
JWT_SECRET=your_jwt_secret 
RAZORPAY_KEY_ID=your_razorpay_key_id 
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
