const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
const { sendOrderConfirmationEmail } = require('../utils/sendOrderConfirmationEmail'); // Update the path as necessary

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

// Create Order Route
router.post('/createOrder', async (req, res) => {
    try {
        const { amount, email, items } = req.body; // Expecting amount, email, and items to be sent in request body
        
        // Check if the email is defined
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, msg: 'Email is required.' });
        }

        const options = {
            amount: amount * 100, // Convert amount to paise
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`
        };

        // Create the Razorpay order
        const order = await razorpayInstance.orders.create(options);
        
        if (order) {
            const orderDetails = {
                _id: order.id,
                total: amount,
                items: items // Ensure you pass the items details in the request body
            };

            // Proceed to handle the payment through Razorpay (example: redirect to payment page)
            // This part depends on your payment flow (not included in this snippet)

            // After confirming payment (you might want to integrate webhook or payment confirmation here)
            const paymentSuccessful = true; // Replace with actual payment confirmation logic

            if (paymentSuccessful) {
                // Send order confirmation email after successful payment
                await sendOrderConfirmationEmail(email, orderDetails);
                
                res.status(200).json({
                    success: true,
                    orderId: order.id,
                    amount: amount,
                    key_id: RAZORPAY_ID_KEY
                });
            } else {
                res.status(400).json({ success: false, msg: 'Payment failed, order not confirmed!' });
            }
        } else {
            res.status(400).json({ success: false, msg: 'Order creation failed!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
});

module.exports = router;