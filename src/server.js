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



// Middleware
app.use(express.json());
app.use(cors());

// static files from public directory
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/static", express.static(path.join(__dirname, "static")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to MongoDB
connectDB("mongodb://127.0.0.1:27017/nassamat_beladi");

// API Routes
app.use("/api/users", userRoutes);
app.use("/admin/categories", categoryRoutes);
app.use("/admin/products", productRoutes);
app.use("/admin/coupons", couponRoutes);
app.use("/admin/orders", orderRoutes);
app.use("/admin/reviews", reviewRoutes);

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

// Home route
app.get("/", (req, res) => {
  res.render("index");
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
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
