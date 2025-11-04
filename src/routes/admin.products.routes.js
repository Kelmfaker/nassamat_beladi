const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth.middleware");
const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
// Optional sharp for server-side resizing. If not installed, we gracefully skip resizing.
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  sharp = null;
  console.warn('sharp not installed — server-side image resizing will be skipped');
}

// Configure multer for image uploads
// Ensure upload directory exists and use absolute path to be robust on Windows
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// GET - All products list
router.get("/", isAdmin, async (req, res) => {
  try {
    // fetch products and categories so the admin products view (which includes
    // the create/edit forms) has the data it expects
  const products = await Product.find().populate("category").lean();
  const categories = await Category.find().lean();
  // pass useAdminHeader for explicit override if templates prefer it
  // render unified admin/products/index.ejs
  res.render("admin/products/index", { products, categories, user: req.user, useAdminHeader: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET - Create product form
router.get("/create", isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().lean();
    // the new product form view is at src/views/admin/products/new.ejs
    res.render("admin/products/new", { categories, user: req.user });
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

    // If sharp is available, create resized variants (sm/md/lg)
    if (req.file && sharp) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
        const parsed = path.parse(req.file.filename);
        const originalPath = path.join(uploadDir, req.file.filename);
        const variants = [ { suffix: '-sm', width: 400 }, { suffix: '-md', width: 800 }, { suffix: '-lg', width: 1200 } ];
        await Promise.all(variants.map(v => {
          const outName = parsed.name + v.suffix + parsed.ext;
          const outPath = path.join(uploadDir, outName);
          return sharp(originalPath).resize({ width: v.width }).toFile(outPath);
        }));
      } catch (resizeErr) {
        console.error('Image resize error:', resizeErr);
      }
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      inStock: inStock === "on",
    });

    await product.save();
    // If client expects JSON (AJAX), return created product JSON
    if (req.xhr || req.accepts("json") === "json") {
      return res.status(201).json({ success: true, product });
    }
    return res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET - Edit product form
router.get("/:id/edit", isAdmin, async (req, res) => {
  try {
    // Editing via modal on the main admin/products page — redirect back
    // to the list and let client-side modal handle editing
    return res.redirect('/admin/products');
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

      // resize variants on update as well if sharp present
      if (sharp) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
          const parsed = path.parse(req.file.filename);
          const originalPath = path.join(uploadDir, req.file.filename);
          const variants = [ { suffix: '-sm', width: 400 }, { suffix: '-md', width: 800 }, { suffix: '-lg', width: 1200 } ];
          await Promise.all(variants.map(v => {
            const outName = parsed.name + v.suffix + parsed.ext;
            const outPath = path.join(uploadDir, outName);
            return sharp(originalPath).resize({ width: v.width }).toFile(outPath);
          }));
        } catch (resizeErr) {
          console.error('Image resize error (update):', resizeErr);
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).lean();
    if (!updated) {
      if (req.xhr || req.accepts("json") === "json") {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(404).send("Product not found");
    }

    // AJAX clients prefer JSON
    if (req.xhr || req.accepts("json") === "json") {
      return res.json({ success: true, product: updated });
    }

    return res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE - Delete product
router.post("/:id/delete", isAdmin, async (req, res) => {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id).lean();
    if (!removed) {
      if (req.xhr || req.accepts("json") === "json") {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.status(404).send("Product not found");
    }

    if (req.xhr || req.accepts("json") === "json") {
      return res.json({ success: true });
    }

    return res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ✅ MUST EXPORT ROUTER
module.exports = router;

