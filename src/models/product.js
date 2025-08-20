const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    promoPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" }
  },
  { timestamps: true }
);

module.exports = model("Product", productSchema);
