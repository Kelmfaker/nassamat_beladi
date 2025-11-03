const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth.middleware");
const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/products/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// GET - All products list
router.get("/", isAdmin, async (req, res) => {
  try {
    const products = await Product.find().populate("category").lean();
    res.render("admin/products/index", { products, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET - Create product form
router.get("/create", isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.render("admin/products/create", { categories, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST - Create product
router.post("/", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const image = req.file ? `/images/products/${req.file.filename}` : null;

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      inStock: inStock === "on",
    });

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET - Edit product form
router.get("/:id/edit", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    const categories = await Category.find().lean();
    res.render("admin/products/edit", { product, categories, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// PUT - Update product
router.post("/:id", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const updateData = {
      name,
      description,
      price,
      category,
      inStock: inStock === "on",
    };

    if (req.file) {
      updateData.image = `/images/products/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE - Delete product
router.post("/:id/delete", isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ✅ MUST EXPORT ROUTER
module.exports = router;

