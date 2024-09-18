const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      type: { type: String, required: true },
      quantity: { type: Number, required: true },
      totalPrice: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, // e.g., 'Pending', 'Processing', 'Completed', 'Cancelled'
  paymentMethod: { type: String, default: 'None' }, // e.g., 'Razorpay'
  paymentStatus: { type: String, default: 'Not Paid' }, // e.g., 'Not Paid', 'Paid', 'Failed'
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }, // Reference to Payment document
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
