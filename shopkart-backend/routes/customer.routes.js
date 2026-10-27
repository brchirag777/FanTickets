const express = require('express');
const router = express.Router();
const { 
    registerCustomer, 
    loginCustomer, 
    myProfile, 
    logoutCustomer,
    changePassword 
} = require('../controllers/customer.controller');
const  protect  = require('../middlewares/auth.middleware');

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', protect, myProfile);
router.post('/logout', protect, logoutCustomer);
router.patch('/change-password', protect, changePassword); // Bonus

module.exports = router;
