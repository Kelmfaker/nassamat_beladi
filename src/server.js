require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { attachUser } = require("./middleware/auth.middleware");
const connectDB = require("./config/database");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");



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
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");


const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachUser); // must come before app.use('/auth', ...) and other routes

// views + static
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin/categories", categoryRoutes);
app.use("/admin/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/admin/orders", orderRoutes);
app.use("/cart", cartRoutes);

// Home route (single response)
app.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().populate("category").lean();
    return res.render("index", { products, user: req.user || null });
  } catch (err) {
    return next(err);
  }
});

// 404 (no next here)
app.use((req, res) => {
  if (res.headersSent) return;
  res.status(404).send("Not Found");
});

// Error handler (guard headersSent)
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).send("Internal Server Error");
});

// Start after DB connects
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Static files served from: ${path.join(__dirname, "../public")}`);
    });
  })
  .catch((e) => {
    console.error("❌ Failed to connect to MongoDB:", e);
    process.exit(1);
  });
