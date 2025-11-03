const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, requireAdmin } = require('../middleware/auth.middleware');
const Order = require('../models/order');

const router = express.Router();

router.get('/', protect, requireAdmin, [query('status').optional().isString()], async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const orders = await Order.find(filter).populate('user','name email').sort({ createdAt: -1 }).lean();
    res.render('admin/orders/index', { orders, user: req.user || null });
  } catch (e) { next(e); }
});

router.get('/:id', protect, requireAdmin, [param('id').isMongoId()], async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user','name email').lean();
    if (!order) return res.redirect('/admin/orders');
    res.render('admin/orders/show', { order, user: req.user || null });
  } catch (e) { next(e); }
});

router.post('/:id/status', protect, requireAdmin, [param('id').isMongoId(), body('status').isIn(['pending','confirmed','processing','shipped','delivered','cancelled'])], async (req, res, next) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect(`/admin/orders/${req.params.id}`);
  } catch (e) { next(e); }
});

router.post('/:id/delete', protect, requireAdmin, [param('id').isMongoId()], async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/admin/orders');
  } catch (e) { next(e); }
});

module.exports = router;