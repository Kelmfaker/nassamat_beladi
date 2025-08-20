const Order = require("../models/order");

exports.createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") // نجيب فقط الاسم والإيميل
      .populate("products.product", "name price") // نجيب اسم وسعر المنتج
      .populate("coupon", "code discountValue"); // كود الكوبون والخصم
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("coupon", "code discountValue");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
