const router = require("express").Router();
const orderCtrl = require("../controllers/order.controller");

// جلب كل الطلبات
router.get("/", orderCtrl.getOrders);

// جلب طلب واحد بالـ id
router.get("/:id", orderCtrl.getOrder);

// إنشاء طلب جديد
router.post("/", orderCtrl.createOrder);

// تحديث طلب
// (مثلاً لتغيير الحالة من pending → paid)
router.patch("/:id", orderCtrl.createOrder);

// حذف طلب
router.delete("/:id", orderCtrl.createOrder);

module.exports = router;
