const jwt = require("jsonwebtoken");
const User = require("../models/users");

async function attachUser(req, res, next) {
  res.locals.user = null; // ensure always defined
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('name email role').lean();
    if (user) { req.user = user; res.locals.user = user; }
  } catch (_) { /* ignore */ }
  next();
}

function protect(req, res, next) {
  if (!req.user) return res.redirect("/auth/login");
  next();
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).send("Forbidden");
  next();
}

module.exports = { attachUser, protect, isAdmin };