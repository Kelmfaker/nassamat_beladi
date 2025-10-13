const router = require("express").Router();
const productCtrl = require("../controllers/product.controller");

router.get("/", productCtrl.getProducts);
router.get("/:id", productCtrl.getProduct);
router.post("/add", productCtrl.createProduct);
router.patch("/:id", productCtrl.updateProduct);
router.delete("/:id", productCtrl.deleteProduct);

module.exports = router;
