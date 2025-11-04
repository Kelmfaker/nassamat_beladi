const express = require('express');
const { protect, isAdmin } = require('../middleware/auth.middleware');
const User = require('../models/users'); // Changed from '../models/user' to '../models/users'
const router = express.Router();

// GET /admin/users - List all users
router.get('/', protect, isAdmin, async (req, res, next) => {
  try {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
  // render the admin users list view at src/views/admin/users/index.ejs
  res.render('admin/users/index', { users, user: req.user || null });
  } catch (e) {
    next(e);
  }
});

// GET /admin/users/:id - View user details
router.get('/:id', protect, isAdmin, async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password').lean();
  if (!u) return res.redirect('/admin/users');
  // render the user detail view at src/views/admin/users/show.ejs
  res.render('admin/users/show', { u, user: req.user || null });
  } catch (e) {
    next(e);
  }
});

// POST /admin/users/:id - Update user
router.post('/:id', protect, isAdmin, async (req, res, next) => {
  try {
    const update = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role
    };
  await User.findByIdAndUpdate(req.params.id, update);
  // After update, go back to users list
  res.redirect('/admin/users');
  } catch (e) {
    next(e);
  }
});

// POST /admin/users/:id/delete - Delete user
router.post('/:id/delete', protect, isAdmin, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (e) {
    next(e);
  }
});

module.exports = router;