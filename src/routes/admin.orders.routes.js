const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Order = require('../models/order');

const router = express.Router();

router.get('/', protect, isAdmin, [query('status').optional().isString()], async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
  const orders = await Order.find(filter).populate('user','name email').sort({ createdAt: -1 }).lean();
  // render the orders view at src/views/admin/orders/index.ejs
  res.render('admin/orders/index', { orders, user: req.user || null });
  } catch (e) { next(e); }
});

router.get('/:id', protect, isAdmin, [param('id').isMongoId()], async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user','name email').lean();
  if (!order) return res.redirect('/admin/orders');
  // No dedicated order detail view yet; redirect back to list
  return res.redirect('/admin/orders');
  } catch (e) { next(e); }
});

router.post('/:id/status', protect, isAdmin, [param('id').isMongoId(), body('status').isIn(['pending','confirmed','processing','shipped','delivered','cancelled'])], async (req, res, next) => {
  try {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  // After status change, return to the orders list
  res.redirect('/admin/orders');
  } catch (e) { next(e); }
});

router.post('/:id/delete', protect, isAdmin, [param('id').isMongoId()], async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/admin/orders');
  } catch (e) { next(e); }
});

module.exports = router;