const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');

// GET /products - List all products with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12; // Products per page
    const skip = (page - 1) * limit;

    // Get category filter if exists
    const categoryFilter = req.query.category && req.query.category !== 'all' 
      ? { category: req.query.category } 
      : {};

    // Get search query if exists
    const searchQuery = req.query.q 
      ? { name: { $regex: req.query.q, $options: 'i' } } 
      : {};

    // Combine filters
    const filter = { ...categoryFilter, ...searchQuery };

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    if (req.query.sort === 'price_desc') sort = { price: -1 };
    if (req.query.sort === 'name') sort = { name: 1 };

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    // Get all categories for filter chips
    const categories = await Category.find().lean();

    // Render the products page
    res.render('products', {
      products,
      categories,
      currentPage: page,
      totalPages,
      totalProducts,
      user: req.user || null
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
});

// GET /products/:id - Single product detail page
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .lean();

    if (!product) {
      return res.status(404).render('error', { 
        message: 'المنتج غير موجود',
        user: req.user || null 
      });
    }

    // Get related products from same category (guard if product has no category)
    let relatedProducts = [];
    if (product.category && product.category._id) {
      relatedProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id }
      })
      .limit(4)
      .lean();
    }

    res.render('product-detail', {
      product,
      relatedProducts,
      user: req.user || null
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    next(error);
  }
});

module.exports = router;
