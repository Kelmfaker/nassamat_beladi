const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const Order = require('../models/order');
const Product = require('../models/product');

const router = express.Router();

// My orders list
router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.render('user/orders', { orders, user: req.user });
  } catch (e) { next(e); }
});

// Create order
router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }),
    body('address.fullName').notEmpty(),
    body('address.phone').notEmpty(),
    body('address.address').notEmpty(),
    body('address.city').notEmpty(),
    body('address.wilaya').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const items = await Promise.all(req.body.items.map(async it => {
        const p = await Product.findById(it.product).lean();
        if (!p) throw new Error('Product not found');
        return {
          product: p._id,
          name: p.name,
          image: p.image,
          price: p.discount ? Number((p.price * (1 - p.discount/100)).toFixed(2)) : p.price,
          quantity: Number(it.quantity || 1),
        };
      }));
      const totalAmount = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const order = await Order.create({ user: req.user._id, items, totalAmount, address: req.body.address });
      res.status(201).json({ success: true, orderId: order._id, orderNumber: order.orderNumber });
    } catch (e) { next(e); }
  }
);

// View my order
router.get('/:id', protect, [param('id').isMongoId()], async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).render('error', { message: 'الطلب غير موجود', user: req.user });
    res.render('user/order-detail', { order, user: req.user });
  } catch (e) { next(e); }
});

// Cancel (if pending/confirmed)
router.post('/:id/cancel', protect, [param('id').isMongoId()], async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).send('Not found');
    if (!['pending','confirmed'].includes(order.status)) return res.status(400).send('Cannot cancel');
    order.status = 'cancelled';
    await order.save();
    res.redirect('/orders/my-orders');
  } catch (e) { next(e); }
});

module.exports = router;