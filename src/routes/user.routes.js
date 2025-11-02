const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const User = require('../models/users');
const bcrypt = require('bcryptjs');

// User profile page (for logged-in users)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    return res.render('user/profile', { user, userProfile: user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading profile');
  }
});

// Update user profile
router.post('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, address, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Update basic info
    user.name = name;
    user.email = email;
    user.phone = phone || '';
    user.address = address || '';

    // Update password if provided
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).render('user/profile', { 
          user: req.user, 
          userProfile: user,
          error: 'يجب إدخال كلمة المرور الحالية' 
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).render('user/profile', { 
          user: req.user, 
          userProfile: user,
          error: 'كلمة المرور الحالية غير صحيحة' 
        });
      }

      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();
    return res.render('user/profile', { 
      user: req.user, 
      userProfile: user,
      success: 'تم تحديث الملف الشخصي بنجاح' 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render('user/profile', { 
      user: req.user, 
      userProfile: req.user,
      error: 'خطأ في تحديث الملف الشخصي' 
    });
  }
});

// User orders page
router.get('/orders', protect, async (req, res) => {
  try {
    // You'll implement orders later
    const orders = []; // await Order.find({ user: req.user._id }).populate('products.product').sort({ createdAt: -1 }).lean();
    return res.render('user/orders', { orders, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading orders');
  }
});

// Admin: List all users (admin only)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.render('admin/users', { users, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading users');
  }
});

// Admin: Create user
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
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

// Admin: Update user
router.post('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData = { name, email, role };
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

// Admin: Delete user
router.post('/:id/delete', protect, isAdmin, async (req, res) => {
  try {
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

// Admin: Toggle user active status
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
