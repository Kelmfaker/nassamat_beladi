const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const Review = require('../models/review');
const mongoose = require('mongoose');

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
  const selectedSort = req.query.sort || 'new';
  if (req.query.sort === 'price_asc') sort = { price: 1 };
  if (req.query.sort === 'price_desc') sort = { price: -1 };
  if (req.query.sort === 'name') sort = { name: 1 };

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products
    let products;
    if (selectedSort === 'reviews') {
      // Aggregate to compute average rating per product and sort by it
      const pipeline = [];
      // When matching by category, aggregation needs an ObjectId
      const matchFilter = { ...filter };
      if (matchFilter.category) {
        try { matchFilter.category = mongoose.Types.ObjectId(matchFilter.category); } catch (e) { /* ignore invalid id */ }
      }
      if (Object.keys(matchFilter).length) pipeline.push({ $match: matchFilter });
      // Lookup reviews
      pipeline.push({
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product',
          as: 'reviews'
        }
      });
      // Compute average rating (default 0)
      pipeline.push({
        $addFields: {
          avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] }
        }
      });
      // Lookup category details
      pipeline.push({
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      });
      pipeline.push({ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } });
      // Sort by avgRating desc
      pipeline.push({ $sort: { avgRating: -1 } });
      // Pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
      // Exclude reviews array from final projection
      pipeline.push({ $project: { reviews: 0 } });

      products = await Product.aggregate(pipeline);
    } else {
      products = await Product.find(filter)
        .populate('category', 'name description')
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean();

      // Attach average ratings for the visible products
      try {
        const prodIds = products.map(p => mongoose.Types.ObjectId(p._id));
        if (prodIds.length) {
          const ratings = await Review.aggregate([
            { $match: { product: { $in: prodIds } } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' } } }
          ]);
          const ratingMap = {};
          ratings.forEach(r => { ratingMap[String(r._id)] = r.avgRating; });
          products = products.map(p => ({
            ...p,
            avgRating: ratingMap[String(p._id)] ? Number(ratingMap[String(p._id)]) : 0
          }));
        }
      } catch (e) {
        console.error('Failed to attach avg ratings:', e);
      }
    }

    // Get all categories for filter chips
    const categories = await Category.find().lean();

    // Determine selected category (for description and initial active chip)
    let selectedCategory = null;
    if (req.query.category && req.query.category !== 'all') {
      selectedCategory = categories.find(c => String(c._id) === String(req.query.category)) || null;
    }

    // Build a base query string (excluding page) so pagination links keep filters/sorts
    const baseParts = [];
    if (req.query.category) baseParts.push(`category=${encodeURIComponent(req.query.category)}`);
    if (req.query.q) baseParts.push(`q=${encodeURIComponent(req.query.q)}`);
    if (req.query.sort) baseParts.push(`sort=${encodeURIComponent(req.query.sort)}`);
    const baseQueryString = baseParts.length ? '&' + baseParts.join('&') : '';

    // Render the products page
    res.render('products', {
      products,
      categories,
      currentPage: page,
      totalPages,
      totalProducts,
      user: req.user || null,
      selectedCategoryId: selectedCategory ? String(selectedCategory._id) : 'all',
      selectedCategoryDesc: selectedCategory ? (selectedCategory.description || '') : '',
      selectedSort: selectedSort,
      baseQueryString: baseQueryString
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
