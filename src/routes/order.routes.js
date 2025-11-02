const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Order = require('../models/order');
const Product = require('../models/product');

// User: Get checkout page
router.get('/checkout', protect, (req, res) => {
  return res.render('user/checkout', { user: req.user });
});

// User: Create order
router.post('/checkout', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    
    console.log('Received order data:', { items, shippingAddress, paymentMethod });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'السلة فارغة' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.wilaya || !shippingAddress.city || !shippingAddress.address) {
      return res.status(400).json({ success: false, error: 'يرجى تعبئة جميع بيانات الشحن المطلوبة' });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          error: `المنتج غير موجود: ${item.productId}` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: `المنتج "${product.name}" غير متوفر بالكمية المطلوبة` 
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        wilaya: shippingAddress.wilaya,
        postalCode: shippingAddress.postalCode || ''
      },
      notes: notes || ''
    });

    console.log('Order created successfully:', order._id);

    return res.json({ 
      success: true, 
      orderId: order._id, 
      orderNumber: order.orderNumber 
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'خطأ في إنشاء الطلب: ' + err.message 
    });
  }
});

// User: View their orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .lean();
    return res.render('user/orders', { orders, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading orders');
  }
});

// User: View single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone')
      .lean();

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).send('Forbidden');
    }

    const success = req.query.success === 'true';
    return res.render('user/order-detail', { order, user: req.user, success });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading order');
  }
});

// User: Cancel order
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Forbidden');
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).send('Cannot cancel this order');
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'User cancelled';
    await order.save();

    return res.redirect('/orders/my-orders');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error cancelling order');
  }
});

// Admin: View all orders
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .lean();
    return res.render('admin/orders', { orders, user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading orders');
  }
});

// Admin: Update order status
router.post('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const updateData = { status };
    
    if (deliveryDate) {
      updateData.deliveryDate = deliveryDate;
    }

    await Order.findByIdAndUpdate(req.params.id, updateData);
    return res.redirect('/orders/admin/all');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error updating order');
  }
});

// Admin: Delete order
router.post('/:id/delete', protect, isAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    return res.redirect('/orders/admin/all');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error deleting order');
  }
});

module.exports = router;
