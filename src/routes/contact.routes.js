const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Message = require('../models/message');

// GET /contact - show contact form
router.get('/', (req, res) => {
  res.render('contact', { success: false, user: req.user || null });
});

// POST /contact - receive form and persist to uploads/messages.jsonl
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body || {};
    if (!message || !(name || email)) {
      return res.status(400).render('contact', { success: false, error: 'الرجاء ملء الحقول المطلوبة', user: req.user || null });
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    const outFile = path.join(uploadsDir, 'messages.jsonl');

    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }

    const entry = {
      name: name || null,
      email: email || null,
      message: message,
      createdAt: new Date()
    };

    // Try to persist to MongoDB first. If that fails, fall back to file append.
    let saved = false;
    try {
      await Message.create(entry);
      saved = true;
    } catch (dbErr) {
      // swallow DB error and fallback to file-based persistence below
      console.warn('Failed to save contact message to DB, falling back to file:', dbErr && dbErr.message ? dbErr.message : dbErr);
    }

    if (!saved) {
      // ensure uploads dir exists
      try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }
      const fileEntry = { ...entry, createdAt: new Date().toISOString() };
      fs.appendFileSync(outFile, JSON.stringify(fileEntry, null, 0) + '\n');
    }

    // render thank you state
    return res.render('contact', { success: true, user: req.user || null });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
