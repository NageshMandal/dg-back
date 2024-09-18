const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { sendOrderConfirmationEmail } = require('../utils/sendOrderConfirmationEmail');
const User = require("../models/User")

// Dummy payment gateway function
const simulatePayment = (amount) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `dummy_payment_${Math.random() * 10000}`,
        status: 'paid'
      });
    }, 1000); // Simulate a 1-second delay
  });
};

const mongoose = require('mongoose');

router.post('/payment/initiate', async (req, res) => {
  try {
    const { userId } = req.body;

    // Retrieve user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate order totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = 5.00;
    const tax = parseFloat((0.05 * subtotal).toFixed(2));
    const total = parseFloat(subtotal + shipping + tax).toFixed(2);

    // Simulate a payment (replace with actual payment gateway)
    const paymentResponse = await simulatePayment(total);
    console.log(paymentResponse)
    // Create a payment record
    const payment = new Payment({
      userId,
      orderId: null, // Will be updated once the order is created
      razorpayOrderId: paymentResponse.id,
      amount: total,
      status: 'created'
    });
    await payment.save();

    // Return payment details to the frontend
    res.json({
      razorpayOrderId: paymentResponse.id,
      amount: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error initiating payment' });
  }
});

router.post('/payment/success', async (req, res) => {
  try {
    const { razorpayOrderId, userId } = req.body;

    // Retrieve the payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Check if payment has already been processed
    if (payment.status === 'paid') {
      return res.status(200).json({ message: 'Payment already processed' });
    }

    // Update payment status
    payment.status = 'paid';
    await payment.save();

    // Retrieve the cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate order totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = 5.00;
    const tax = parseFloat((0.05 * subtotal).toFixed(2));
    const total = parseFloat(subtotal + shipping + tax).toFixed(2);

    // Create the order
    const order = new Order({
      userId,
      items: cart.items,
      subtotal,
      shipping,
      tax,
      total,
      status: 'Processing',
      paymentMethod: 'Dummy', // Change based on actual method
      paymentStatus: 'Paid',
      paymentId: payment._id // Link to Payment record
    });
    await order.save();

    // Update the payment record with the orderId
    payment.orderId = order._id;
    await payment.save();

    // Clear the user's cart
    cart.items = []; // Remove all items from the cart
    await cart.save(); // Save the updated empty cart to the database

    // Send confirmation email
    const user = await User.findById(userId);
    await sendOrderConfirmationEmail(user.email, order);

    // Send response back to frontend
    res.json({ message: 'Order placed successfully', orderId: order._id });
  } catch (error) {
    res.status(500).json({ error: 'Error processing payment and placing order' });
  }
});



module.exports = router