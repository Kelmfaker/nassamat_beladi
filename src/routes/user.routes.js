const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Order = require('../models/order');

// Profile page
router.get('/profile', protect, async (req, res, next) => {
  try {
    const ordersCount = await Order.countDocuments({ user: req.user._id });
    res.render('user/profile', { user: req.user, ordersCount });
  } catch (err) {
    next(err);
  }
});

// (Optional) handle profile updates
router.post('/profile', protect, async (req, res, next) => {
  try {
    // TODO: update user fields in DB then refresh
    res.redirect('/users/profile');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
