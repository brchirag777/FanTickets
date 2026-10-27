# ShopKart - MERN E-Commerce Platform

A full-stack e-commerce web application built for a college lab project. It features user authentication, a global shopping cart, and a fully integrated Razorpay checkout flow with cryptographic signature verification.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Context API
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Payments:** Razorpay Test API
* **Authentication:** JWT (JSON Web Tokens)

## Features
* User Registration and Login (JWT Auth)
* Dynamic Product Browsing and Cart Management
* Secure Checkout with strict server-side total calculation
* Order creation and Razorpay Test Mode integration
* Backend HMAC SHA-256 Payment Signature Verification
* Order History Dashboard

## Local Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory: `cd shopkart-backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the backend root with the following variables:
