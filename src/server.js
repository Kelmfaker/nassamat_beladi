require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");

// Models
const Category = require("./models/category");
const Product = require("./models/product");
const User = require("./models/users");
const Order = require("./models/order");
const Coupon = require("./models/coupon");
const Review = require("./models/review");

// Routes
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const couponRoutes = require("./routes/coupon.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files - FIXED PATH
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../public")));

// Connect to MongoDB Atlas
connectDB();

// Home route with error handling
app.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    const categories = await Category.find();
    res.render("index", { products, categories });
  } catch (err) {
    console.error("Error loading home page:", err);
    res.render("index", { products: [], categories: [] });
  }
});

// API Routes
app.use("/auth", userRoutes);
app.use("/admin/categories", categoryRoutes);
app.use("/admin/products", productRoutes);
app.use("/admin/orders", orderRoutes);
app.use("/admin/coupons", couponRoutes);

// Cart and Contact routes
app.get("/cart", (req, res) => {
  res.render("cart");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Frontend Pages
app.get("/pages/:name", async (req, res) => {
  const name = req.params.name;
  let data = {};

  try {
    switch (name) {
      case "categories":
        data.categories = await Category.find();
        break;
      case "products":
      case "showproducts":
      case "index":
        data.products = await Product.find().populate("category");
        data.categories = await Category.find();
        break;
      case "users":
        data.users = await User.find();
        break;
      case "orders":
        data.orders = await Order.find().populate("user").populate("products.product");
        break;
      case "coupons":
        data.coupons = await Coupon.find();
        break;
      case "reviews":
        data.reviews = await Review.find().populate("product").populate("user");
        break;
      default:
        return res.status(404).send("Page not found");
    }

    res.render(`pages/${name}`, data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading page data");
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, "../public")}`);
});
