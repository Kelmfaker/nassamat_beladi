const express = require('express');
const { body, param } = require('express-validator');
const { protect, requireAdmin } = require('../middleware/auth.middleware');
const Category = require('../models/category');
const router = express.Router();

router.get('/', protect, requireAdmin, async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.render('admin/categories/index', { categories, user: req.user || null });
  } catch (e) { next(e); }
});

router.post('/', protect, requireAdmin, [body('name').trim().notEmpty()], async (req, res, next) => {
  try {
    await Category.create({ name: req.body.name });
    res.redirect('/admin/categories');
  } catch (e) { next(e); }
});

router.post('/:id', protect, requireAdmin, [param('id').isMongoId(), body('name').trim().notEmpty()], async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.redirect('/admin/categories');
  } catch (e) { next(e); }
});

router.post('/:id/delete', protect, requireAdmin, [param('id').isMongoId()], async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/admin/categories');
  } catch (e) { next(e); }
});

module.exports = router;