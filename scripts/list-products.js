require('dotenv').config();
const connectDB = require('../src/config/database');
// Ensure Category model is registered before requiring Product so populate('category') works
const Category = require('../src/models/category');
const Product = require('../src/models/product');

(async () => {
  try {
    await connectDB();
    const prods = await Product.find().limit(50).populate('category').lean();
    console.log('Found', prods.length, 'products (showing up to 50)');
    prods.forEach(p => console.log(p._id.toString(), '-', p.name, '-', p.category ? p.category._id.toString() : 'no-cat', '-', p.category ? p.category.name : 'no-cat-name'));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();