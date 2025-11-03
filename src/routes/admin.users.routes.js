const express = require('express');
const { protect, requireAdmin } = require('../middleware/auth.middleware');
const User = require('../models/users'); // Changed from '../models/user' to '../models/users'

const router = express.Router();

// GET /admin/users - List all users
router.get('/', protect, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.render('admin/users/index', { users, user: req.user || null });
  } catch (e) {
    next(e);
  }
});

// GET /admin/users/:id - View user details
router.get('/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id).select('-password').lean();
    if (!u) return res.redirect('/admin/users');
    res.render('admin/users/show', { u, user: req.user || null });
  } catch (e) {
    next(e);
  }
});

// POST /admin/users/:id - Update user
router.post('/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const update = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role
    };
    await User.findByIdAndUpdate(req.params.id, update);
    res.redirect(`/admin/users/${req.params.id}`);
  } catch (e) {
    next(e);
  }
});

// POST /admin/users/:id/delete - Delete user
router.post('/:id/delete', protect, requireAdmin, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (e) {
    next(e);
  }
});

module.exports = router;