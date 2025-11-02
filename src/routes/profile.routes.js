const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, async (req, res) => {
  // Optionally compute ordersCount here if needed
  res.render('user/profile', { user: req.user, ordersCount: undefined });
});

router.post('/', protect, async (req, res) => {
  // Update name/email/phone/city in your User model
  // await User.findByIdAndUpdate(req.user._id, { ...req.body });
  res.redirect('/profile');
});

router.post('/address', protect, async (req, res) => {
  // Update default shipping address on user
  // await User.findByIdAndUpdate(req.user._id, { address: req.body });
  res.redirect('/profile');
});

router.post('/password', protect, async (req, res) => {
  // Implement change password logic
  res.redirect('/profile');
});

router.post('/avatar', protect, async (req, res) => {
  // Handle avatar upload (multer) then save URL on user
  res.redirect('/profile');
});

module.exports = router;