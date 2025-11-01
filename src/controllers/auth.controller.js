const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false // set true behind HTTPS
  });
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { error: null, old: {} });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", { error: null, old: {} });
};

exports.postSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("auth/signup", { error: errors.array()[0].msg, old: req.body });
  }
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).render("auth/signup", { error: "كلمتا المرور غير متطابقتين", old: req.body });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).render("auth/signup", { error: "الحساب موجود مسبقاً", old: req.body });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    setAuthCookie(res, token);
    res.redirect("/");
  } catch (err) {
    res.status(500).render("auth/signup", { error: "خطأ في إنشاء الحساب", old: req.body });
  }
};

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("auth/login", { error: errors.array()[0].msg, old: req.body });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).render("auth/login", { error: "بيانات الدخول غير صحيحة", old: { email } });
    }
    const token = signToken(user);
    setAuthCookie(res, token);
    res.redirect("/");
  } catch (err) {
    res.status(500).render("auth/login", { error: "خطأ في تسجيل الدخول", old: { email } });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};