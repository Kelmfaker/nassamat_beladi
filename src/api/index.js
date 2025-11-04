const connectDB = require('../config/database');
const app = require('../server');

let ready = false;

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET' && req.url && req.url.startsWith('/_health')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, env: process.env.NODE_ENV || 'development' }));
      return;
    }

    if (!ready) {
      await connectDB();
      ready = true;
    }

    return app(req, res);
  } catch (err) {
    // Log error with stack to help diagnose runtime issues on Vercel
    console.error('Serverless handler error:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
};
