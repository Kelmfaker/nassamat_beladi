const connectDB = require('../src/config/database');
const app = require('../src/server');

// Ensure DB is connected before handling requests. connectDB caches connection so
// repeated invocations are cheap in serverless environments.
let ready = false;

module.exports = async (req, res) => {
  try {
    // Quick health-check: respond without connecting to DB to allow fast liveness checks
    if (req.method === 'GET' && req.url && req.url.startsWith('/_health')) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, env: process.env.NODE_ENV || 'development' }));
      return;
    }

    if (!ready) {
      // connectDB throws a descriptive error if MONGO_URI is missing
      await connectDB();
      ready = true;
    }

    // Forward the incoming request to the Express app
    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    // Return JSON helpful message (avoid exposing sensitive details)
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
};
