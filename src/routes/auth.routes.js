const router = require("express").Router();
const { body } = require("express-validator");
const auth = require("../controllers/auth.controller");

router.get("/login", auth.getLogin);
router.get("/signup", auth.getSignup);

router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("الاسم قصير"),
    body("email").isEmail().withMessage("بريد غير صالح").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("الحد الأدنى 6 أحرف"),
    body("confirmPassword").notEmpty().withMessage("تأكيد كلمة المرور مطلوب")
  ],
  auth.postSignup
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("بريد غير صالح"), body("password").notEmpty().withMessage("كلمة المرور مطلوبة")],
  auth.postLogin
);

router.get("/logout", auth.logout);

module.exports = router;