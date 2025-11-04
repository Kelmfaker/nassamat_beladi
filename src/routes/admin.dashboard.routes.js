const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth.middleware');
const Product = require('../models/product');
const User = require('../models/users');
const Order = require('../models/order');

// Admin dashboard
router.get('/', isAdmin, async (req, res, next) => {
  try {
    // Basic counts
    const [productsCount, usersCount, ordersCount, revenueAgg, recentOrdersRaw] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      // recent orders for table
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user').lean()
    ]);

    const totalRevenue = (revenueAgg && revenueAgg.length) ? revenueAgg[0].total : 0;

    // Prepare last 7 days labels and aggregates for charts
    const today = new Date();
    today.setHours(0,0,0,0);
    const start = new Date(today);
    start.setDate(start.getDate() - 6); // 7 days total

    const agg = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        revenue: { $sum: "$totalAmount" }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Build arrays for each day
    const labels = [];
    const ordersData = [];
    const revenueData = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + d);
      const key = dt.toISOString().slice(0,10);
      labels.push(key);
      const row = agg.find(a => a._id === key);
      ordersData.push(row ? row.count : 0);
      revenueData.push(row ? row.revenue : 0);
    }

    return res.render('admin/dashboard/index', {
      user: req.user,
      productsCount,
      usersCount,
      ordersCount,
      totalRevenue,
      recentOrders: recentOrdersRaw,
      chart: { labels, ordersData, revenueData },
      useAdminHeader: true
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
