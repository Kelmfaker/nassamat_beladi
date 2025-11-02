const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Product = require('../models/product');
const Category = require('../models/category');

// List products (admin UI)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate('category').sort({ createdAt: -1 }).lean();
    const categories = await Category.find().lean();
    return res.render('admin/products', { products, categories, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading products');
  }
});

// Create product
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    await Product.create({ 
      name, 
      description, 
      price: parseFloat(price), 
      category, 
      image,
      stock: parseInt(stock) || 0
    });
    return res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error creating product');
  }
});

// Update product
router.post('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { 
      name, 
      description, 
      price: parseFloat(price), 
      category, 
      image,
      stock: parseInt(stock) || 0
    });
    return res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error updating product');
  }
});

// Delete product
router.post('/:id/delete', protect, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error deleting product');
  }
});

module.exports = router;
