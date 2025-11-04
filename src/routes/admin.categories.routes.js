const express = require('express');
const { body, param } = require('express-validator');
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Category = require('../models/category');
const router = express.Router();

router.get('/', protect, isAdmin, async (req, res, next) => {
  try {
  const categories = await Category.find().sort({ name: 1 }).lean();
  // render the categories view at src/views/admin/categories/index.ejs
  res.render('admin/categories/index', { categories, user: req.user || null });
  } catch (e) { next(e); }
});

router.post('/', protect, isAdmin, [body('name').trim().notEmpty()], async (req, res, next) => {
  try {
    await Category.create({ name: req.body.name });
    res.redirect('/admin/categories');
  } catch (e) { next(e); }
});

router.post('/:id', protect, isAdmin, [param('id').isMongoId(), body('name').trim().notEmpty()], async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.redirect('/admin/categories');
  } catch (e) { next(e); }
});

router.post('/:id/delete', protect, isAdmin, [param('id').isMongoId()], async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (e) { next(e); }
});

module.exports = router;