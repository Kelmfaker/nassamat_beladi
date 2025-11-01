const jwt = require("jsonwebtoken");

exports.attachUser = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.user = decoded; // available in EJS
  } catch (_) {}
  next();
};

exports.requireAuth = (req, res, next) => {
  if (!req.user) return res.redirect("/auth/login");
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.redirect("/auth/login");
  if (req.user.role !== "admin") return res.status(403).send("غير مصرح");
  next();
};