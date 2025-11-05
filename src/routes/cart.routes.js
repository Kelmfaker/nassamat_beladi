const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Cart page
router.get('/', async (req, res) => {
  try {
    return res.render('cart', { user: req.user });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading cart');
  }
});

// API: Get product details for cart items
router.post('/validate', async (req, res) => {
  try {
    const { items } = req.body;
    
    // Handle empty or missing items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ valid: true, items: [] });
    }

    // Validate that each item has required fields
    const validItems = items.filter(item => 
      item && item.productId && typeof item.quantity === 'number' && item.quantity > 0
    );

    if (validItems.length === 0) {
      return res.json({ valid: true, items: [] });
    }

    const productIds = validItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category')
      .lean();

    const validatedItems = validItems.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) return null;

      return {
        productId: product._id.toString(),
        name: product.name || 'منتج غير معروف',
        price: product.price || 0,
  image: product.image || '/images/default-product.svg',
        category: product.category?.name || '',
        quantity: parseInt(item.quantity) || 1,
        stock: parseInt(product.stock) || 0,
        available: (parseInt(product.stock) || 0) >= parseInt(item.quantity)
      };
    }).filter(Boolean);

    return res.json({ valid: true, items: validatedItems });
  } catch (err) {
    console.error('Cart validation error:', err);
    return res.status(500).json({ 
      valid: false, 
      error: 'خطأ في التحقق من السلة',
      items: [] 
    });
  }
});

module.exports = router;