require('dotenv').config();
const connectDB = require('../src/config/database');
const Category = require('../src/models/category');

(async () => {
  try {
    await connectDB();
    const cats = await Category.find().lean();
    console.log('Found', cats.length, 'categories');
    cats.forEach(c => console.log(c._id.toString(), '-', c.name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();