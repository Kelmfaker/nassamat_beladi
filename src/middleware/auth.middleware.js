const jwt = require("jsonwebtoken");
const User = require("../models/users");

async function attachUser(req, res, next) {
  res.locals.user = null; // ensure always defined
  res.locals.isAdmin = false;
  res.locals.currentPath = req.path;
  // currency symbol used across templates
  res.locals.currencySymbol = 'MAD';
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('name email role').lean();
    if (user) { req.user = user; res.locals.user = user; }
  } catch (_) { /* ignore */ }
  // expose admin boolean for templates
  try { res.locals.isAdmin = !!(req.user && req.user.role === 'admin'); } catch (e) { res.locals.isAdmin = false; }
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