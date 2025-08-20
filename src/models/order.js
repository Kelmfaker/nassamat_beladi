const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    totalPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"], 
      default: "pending" 
    },
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" }
  },
  { timestamps: true }
);

module.exports = model("Order", orderSchema);
