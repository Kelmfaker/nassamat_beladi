const router = require("express").Router();
const categoryCtrl = require("../controllers/category.controller");

router.get("/", categoryCtrl.getCategories);
router.get("/:id", categoryCtrl.getCategory);
router.post("/add", categoryCtrl.createCategory);
router.patch("/:id", categoryCtrl.updateCategory);
router.delete("/:id", categoryCtrl.deleteCategory);

module.exports = router;
