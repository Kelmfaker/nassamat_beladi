const router = require("express").Router();
const categoryCtrl = require("../controllers/category.controller");
const { requireAdmin } = require("../middleware/auth.middleware");

// protect all category admin routes
router.use(requireAdmin);

router.get("/", categoryCtrl.getAllCategories);
router.post("/add", categoryCtrl.createCategory);
router.post("/edit/:id", categoryCtrl.updateCategory);
router.get("/delete/:id", categoryCtrl.deleteCategory);

module.exports = router;
