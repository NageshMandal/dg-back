const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products
// Get all products with pagination, search, and category filtering
router.get('/', async (req, res) => {
  try {
    // Get query params for pagination, search, and category
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 6; // Default to 6 items per page if not provided
    const searchQuery = req.query.q || ''; // Search query, defaults to empty string if not provided
    const categoryQuery = req.query.category || ''; // Category filter, defaults to empty string if not provided

    // Create a search filter for the 'name' or 'description' fields
    const searchFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive regex search on 'name'
        { description: { $regex: searchQuery, $options: 'i' } } // Case-insensitive regex search on 'description'
      ]
    };

    // If a category is specified, add it to the search filter
    if (categoryQuery) {
      searchFilter.category = categoryQuery; // Assuming category is stored as an ObjectId in the Product model
    }

    // Calculate the number of products to skip for pagination
    const skip = (page - 1) * limit;

    // Fetch total number of matching products for pagination
    const totalProducts = await Product.countDocuments(searchFilter);

    // Fetch products with pagination, search filtering, and populate the category field
    const products = await Product.find(searchFilter)
      .populate('category') // Populating the 'category' field with data from the Category model
      .skip(skip)           // Skip the previous pages of products
      .limit(limit);        // Limit to the number of products per page

    // Calculate total number of pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Return products along with pagination and search info
    res.json({
      page,
      limit,
      totalPages,
      totalProducts,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});



// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image, category, options } = req.body;

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ error: 'Invalid category ID' });

    const product = new Product({ name, description, price, image, category, options });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error creating product' });
  }
});

// Update product by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, image, category, options } = req.body;

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ error: 'Invalid category ID' });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image, category, options },
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

// Delete product by ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
