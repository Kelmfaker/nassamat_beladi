const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 }, // Percentage discount
  image: { type: String },
  images: [String], // Multiple images
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false }, // Badge for new products
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 }, // Review count
  weight: { type: String }, // e.g., "250 غرام"
  tags: [String],
  isFeatured: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);
