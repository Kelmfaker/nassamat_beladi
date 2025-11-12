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
const publicCategoryRoutes = require("./routes/category.routes");
const publicProductRoutes = require("./routes/product.routes");
const couponRoutes = require("./routes/coupon.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const contactRoutes = require("./routes/contact.routes");
const adminDashboardRoutes = require("./routes/admin.dashboard.routes");
const adminUsersRoutes = require("./routes/admin.users.routes");
const adminProductsRoutes = require("./routes/admin.products.routes");
const adminCategoriesRoutes = require("./routes/admin.categories.routes");
const adminOrdersRoutes = require("./routes/admin.orders.routes");
const adminMessagesRoutes = require("./routes/admin.messages.routes");


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

// Public routes
app.use('/products', publicProductRoutes);
app.use('/categories', publicCategoryRoutes);
app.use('/orders', orderRoutes);
app.use('/cart', cartRoutes);
app.use('/contact', contactRoutes);

// Admin routes
app.use('/admin', adminDashboardRoutes);
app.use('/admin/users', adminUsersRoutes);
app.use('/admin/products', adminProductsRoutes);
app.use('/admin/categories', adminCategoriesRoutes);
app.use('/admin/orders', adminOrdersRoutes);
app.use('/admin/messages', adminMessagesRoutes);

app.use('/auth', authRoutes);

// Home route (single response)
app.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().populate("category").lean();
    return res.render("index", { products, user: req.user || null });
  } catch (err) {
    return next(err);
  }
});

// Lightweight health-check (does not require DB). Useful for Vercel readiness checks.
app.get('/_health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// 404 (no next here)
app.use((req, res) => {
  if (res.headersSent) return;
  res.status(404).send("Not Found");
});

// Error handler (guard headersSent)
app.use((err, req, res, next) => {
  // Log full error and stack for debugging
  console.error(err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  // In development show the error stack in the response to help debugging.
  if (process.env.NODE_ENV !== 'production') {
    return res.status(500).send(`<pre style="white-space:pre-wrap;">${(err && err.stack) ? err.stack : String(err)}</pre>`);
  }
  res.status(500).send("Internal Server Error");
});

// Export the app for serverless adapters and local run
module.exports = app;

// Start the HTTP server only when this file is run directly
if (require.main === module) {
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
}
