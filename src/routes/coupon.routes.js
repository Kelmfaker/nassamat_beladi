const router = require("express").Router();
const couponCtrl = require("../controllers/coupon.controller");

router.get("/", couponCtrl.getCoupons);
router.get("/:id", couponCtrl.getCoupon);
router.post("/", couponCtrl.createCoupon);
router.patch("/:id", couponCtrl.updateCoupon);
router.delete("/:id", couponCtrl.deleteCoupon);

module.exports = router;
