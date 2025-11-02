const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const User = require('../models/users');
const bcrypt = require('bcryptjs');

// List all users (admin only)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.render('admin/users', { users, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading users');
  }
});

// Create user (admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).send('User already exists');
    }

    await User.create({ name, email, password, role: role || 'user' });
    return res.redirect('/users');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error creating user');
  }
});

// Update user (admin only)
router.post('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData = { name, email, role };
    
    // Only update password if provided
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(req.params.id, updateData);
    return res.redirect('/users');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error updating user');
  }
});

// Delete user (admin only)
router.post('/:id/delete', protect, isAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).send('Cannot delete your own account');
    }

    await User.findByIdAndDelete(req.params.id);
    return res.redirect('/users');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error deleting user');
  }
});

// Toggle user active status (admin only)
router.post('/:id/toggle-active', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    
    user.isActive = !user.isActive;
    await user.save();
    return res.redirect('/users');
  } catch (err) {
    console.error(err);
    return res.status(400).send('Error updating user status');
  }
});

module.exports = router;
