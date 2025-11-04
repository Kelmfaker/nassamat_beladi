const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Category = require('../models/category');

// List categories (admin UI)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  return res.render('admin/categories/index', { categories, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading categories');
  }
});

// Create category
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    await Category.create({ name: req.body.name, description: req.body.description });
    return res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error creating category');
  }
});

// Update category
router.post('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { 
      name: req.body.name, 
      description: req.body.description 
    });
    return res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error updating category');
  }
});

// Delete category
router.post('/:id/delete', protect, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error deleting category');
  }
});

module.exports = router;
