const express = require('express');
const path = require('path');
const fs = require('fs');
const { isAdmin } = require('../middleware/auth.middleware');
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
router.get('/', isAdmin, (req, res, next) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const file = path.join(uploadsDir, 'messages.jsonl');
    const q = (req.query.q || '').trim().toLowerCase();
    const download = req.query.download || '';

    const all = readMessages(file);
    let list = all;
    if (q) {
      list = all.filter(m => {
        const hay = ((m.name||'') + '|' + (m.email||'') + '|' + (m.message||'')).toLowerCase();
        return hay.includes(q);
      });
    }

    if (download === 'csv') {
      // build CSV
      const header = ['createdAt','name','email','message'];
      const lines = [header.join(',')];
      for (const m of list) {
        // escape double quotes
        const row = [m.createdAt||'', m.name||'', m.email||'', (m.message||'').replace(/"/g, '""')];
        const quoted = row.map(v => '"' + String(v).replace(/"/g, '""') + '"');
        lines.push(quoted.join(','));
      }
      const csv = lines.join('\r\n');
      res.setHeader('Content-Disposition', 'attachment; filename="messages.csv"');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csv);
    }

    // pagination (simple)
    const page = Math.max(1, parseInt(req.query.page||'1', 10) || 1);
    const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage||'50',10) || 50));
    const total = list.length;
    const pages = Math.ceil(total / perPage) || 1;
    const start = (page-1)*perPage;
    const paged = list.slice(start, start+perPage);

    return res.render('admin/messages', { messages: paged, q: req.query.q || '', page, pages, total, perPage, user: req.user || null });
  } catch (err) { return next(err); }
});

module.exports = router;
