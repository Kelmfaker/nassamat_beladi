const express = require('express');
const path = require('path');
const fs = require('fs');
const { isAdmin } = require('../middleware/auth.middleware');
const Message = require('../models/message');
const router = express.Router();

// Helper to read messages.jsonl
function readMessages(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return [];
  return raw.split('\n').map(l => {
    try { return JSON.parse(l); } catch (e) { return null; }
  }).filter(Boolean).reverse(); // show newest first
}

// GET /admin/messages
router.get('/', isAdmin, async (req, res, next) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const file = path.join(uploadsDir, 'messages.jsonl');
    const q = (req.query.q || '').trim();
    const qLower = q.toLowerCase();
    const download = req.query.download || '';

    let list = [];
    let total = 0;

    // Try DB first
    try {
      // build DB query
      const filter = {};
      if (q) {
        // text-like search across fields
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { message: { $regex: q, $options: 'i' } }
        ];
      }

      const page = Math.max(1, parseInt(req.query.page||'1', 10) || 1);
      const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage||'50',10) || 50));

      total = await Message.countDocuments(filter);
      const pages = Math.ceil(total / perPage) || 1;

  const docs = await Message.find(filter).sort({ createdAt: -1 }).skip((page-1)*perPage).limit(perPage).lean();
  list = docs.map(d => ({ id: String(d._id), createdAt: (d.createdAt||new Date()).toISOString(), name: d.name, email: d.email, message: d.message }));

      if (download === 'csv') {
        const header = ['createdAt','name','email','message'];
        const lines = [header.join(',')];
        for (const m of (await Message.find(filter).sort({ createdAt: -1 }).lean())) {
          const row = [m.createdAt||'', m.name||'', m.email||'', (m.message||'').replace(/"/g, '""')];
          const quoted = row.map(v => '"' + String(v).replace(/"/g, '""') + '"');
          lines.push(quoted.join(','));
        }
        const csv = lines.join('\r\n');
        res.setHeader('Content-Disposition', 'attachment; filename="messages.csv"');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res.send(csv);
      }

      // render using DB results
      const pagesCount = Math.ceil(total / (Math.max(10, Math.min(200, parseInt(req.query.perPage||'50',10) || 50)))) || 1;
      return res.render('admin/messages', { messages: list, q: req.query.q || '', page: page, pages: pagesCount, total, perPage: parseInt(req.query.perPage||'50',10) || 50, user: req.user || null });
    } catch (dbErr) {
      // DB failed - fallback to file-based
      console.warn('Admin messages: DB read failed, falling back to file:', dbErr && dbErr.message ? dbErr.message : dbErr);
    }

    // File fallback
    const all = readMessages(file);
    let filtered = all;
    if (qLower) {
      filtered = all.filter(m => {
        const hay = ((m.name||'') + '|' + (m.email||'') + '|' + (m.message||'')).toLowerCase();
        return hay.includes(qLower);
      });
    }

    if (download === 'csv') {
      const header = ['createdAt','name','email','message'];
      const lines = [header.join(',')];
      for (const m of filtered) {
        const row = [m.createdAt||'', m.name||'', m.email||'', (m.message||'').replace(/"/g, '""')];
        const quoted = row.map(v => '"' + String(v).replace(/"/g, '""') + '"');
        lines.push(quoted.join(','));
      }
      const csv = lines.join('\r\n');
      res.setHeader('Content-Disposition', 'attachment; filename="messages.csv"');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csv);
    }

    const page = Math.max(1, parseInt(req.query.page||'1', 10) || 1);
    const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage||'50',10) || 50));
    total = filtered.length;
    const pages = Math.ceil(total / perPage) || 1;
    const start = (page-1)*perPage;
    const paged = filtered.slice(start, start+perPage);

    return res.render('admin/messages', { messages: paged, q: req.query.q || '', page, pages, total, perPage, user: req.user || null });
  } catch (err) { return next(err); }
});

// POST /admin/messages/delete - delete by DB id or by file createdAt
router.post('/delete', isAdmin, async (req, res, next) => {
  try {
    const { id, createdAt } = req.body || {};
    const uploadsDir = path.join(__dirname, '../../uploads');
    const file = path.join(uploadsDir, 'messages.jsonl');

    if (id) {
      // delete from DB
      try {
        await Message.findByIdAndDelete(id);
      } catch (e) {
        console.warn('Failed to delete message from DB', e && e.message ? e.message : e);
      }
    }

    if (createdAt) {
      // also attempt to remove from file store (match by createdAt)
      try {
        if (fs.existsSync(file)) {
          const raw = fs.readFileSync(file, 'utf8').trim();
          if (raw) {
            const lines = raw.split('\n');
            const keep = lines.filter(l => {
              try { const obj = JSON.parse(l); return String(obj.createdAt||'') !== String(createdAt); } catch (e) { return true; }
            });
            fs.writeFileSync(file, keep.join('\n') + (keep.length ? '\n' : ''), 'utf8');
          }
        }
      } catch (e) { console.warn('Failed to delete message from file store', e && e.message ? e.message : e); }
    }

    // redirect back to list preserving query string if present
    const redirectTo = req.get('referer') || '/admin/messages';
    return res.redirect(redirectTo);
  } catch (err) { return next(err); }
});

module.exports = router;
