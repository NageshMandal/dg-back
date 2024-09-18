const mongoose = require('mongoose');

const productOptionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  price: { type: Number, },
  description: { type: String },
  
  schedule: { type: String }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', },
  options: [productOptionSchema]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
