const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { 
      type: String, 
      unique: true 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    items: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String }
      }
    ],
    totalAmount: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], 
      default: "pending" 
    },
    paymentMethod: { 
      type: String, 
      enum: ["cash", "card", "bank_transfer"], 
      default: "cash" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      wilaya: { type: String, required: true },
      postalCode: { type: String }
    },
    notes: { type: String },
    deliveryDate: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String }
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    try {
      const count = await mongoose.model("Order").countDocuments();
      const timestamp = Date.now();
      this.orderNumber = `ORD-${timestamp}-${count + 1}`;
      console.log('Generated order number:', this.orderNumber);
    } catch (error) {
      console.error('Error generating order number:', error);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
