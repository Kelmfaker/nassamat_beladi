const router = require("express").Router();
const reviewCtrl = require("../controllers/review.controller");

// جلب كل التقييمات
router.get("/", reviewCtrl.getReviews);

// جلب تقييم واحد
router.get("/:id", reviewCtrl.getReview);

// إنشاء تقييم جديد
router.post("/", reviewCtrl.createReview);

// تحديث تقييم
router.patch("/:id", reviewCtrl.updateReview);

// حذف تقييم
router.delete("/:id", reviewCtrl.deleteReview);

module.exports = router;
