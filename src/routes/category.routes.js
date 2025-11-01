const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Category = require('../models/category');

// List categories (admin UI)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.render('admin/categories', { categories, user: req.user });
  } catch (e) {
    res.status(500).send('Error loading categories');
  }
});

// Create
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    await Category.create({ name: req.body.name, description: req.body.description });
    res.redirect('/admin/categories');
  } catch (e) {
    res.status(400).send('Error creating category');
  }
});

// Update
router.post('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description });
    res.redirect('/admin/categories');
  } catch (e) {
    res.status(400).send('Error updating category');
  }
});

// Delete
router.post('/:id/delete', protect, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (e) {
    res.status(400).send('Error deleting category');
  }
});

module.exports = router;
