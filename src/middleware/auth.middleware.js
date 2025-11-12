const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Message = require("../models/message");

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
  // expose number of unread/total messages for admin header (fast best-effort)
  try {
    res.locals.adminMessagesCount = 0;
    if (res.locals.isAdmin) {
      try {
        // try DB count first
        const cnt = await Message.countDocuments();
        res.locals.adminMessagesCount = Number(cnt) || 0;
      } catch (dbErr) {
        // fallback to file-based count
        try {
          const fs = require('fs');
          const p = require('path').join(__dirname, '../../uploads/messages.jsonl');
          if (fs.existsSync(p)) {
            const lines = fs.readFileSync(p, 'utf8').trim();
            res.locals.adminMessagesCount = lines ? lines.split('\n').length : 0;
          }
        } catch (fileErr) {
          res.locals.adminMessagesCount = 0;
        }
      }
    }
  } catch (e) { res.locals.adminMessagesCount = 0; }
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