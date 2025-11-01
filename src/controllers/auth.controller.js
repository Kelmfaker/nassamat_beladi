const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/users");
const bcrypt = require("bcryptjs");

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
  return res.render('auth/login', { user: req.user || null, error: null, old: {} });
};

exports.getSignup = (req, res) => {
  return res.render('auth/signup', { user: req.user || null, error: null, old: {} });
};

exports.postSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/signup', { error: errors.array()[0].msg, old: req.body, user: null });
  }
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).render('auth/signup', { error: 'كلمتا المرور غير متطابقتين', old: req.body, user: null });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).render('auth/signup', { error: 'الحساب موجود مسبقاً', old: req.body, user: null });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    setAuthCookie(res, token);
    return res.redirect('/');
  } catch (e) {
    console.error(e);
    return res.status(500).render('auth/signup', { error: 'خطأ في إنشاء الحساب', old: req.body, user: null });
  }
};

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/login', { error: errors.array()[0].msg, old: req.body, user: null });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).render('auth/login', { error: 'بيانات غير صحيحة', old: { email }, user: null });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).render('auth/login', { error: 'بيانات غير صحيحة', old: { email }, user: null });
    const token = signToken(user);
    setAuthCookie(res, token);
    return res.redirect('/');
  } catch (e) {
    console.error(e);
    return res.status(500).render('auth/login', { error: 'خطأ في تسجيل الدخول', old: { email }, user: null });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
};