const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: "bmaw gbjx iero myeq",
  },
});

const sendOrderConfirmationEmail = async (email, order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Confirmation',
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${order._id} has been placed successfully.</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p>We will notify you once your order is shipped.</p>
      <h3>Order Details</h3>
      <ul>
        ${order.items.map(item => `
          <li>
            ${item.productId.name} - ${item.type} x ${item.quantity} = ₹${item.totalPrice}
          </li>
        `).join('')}
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

module.exports = { sendOrderConfirmationEmail };
