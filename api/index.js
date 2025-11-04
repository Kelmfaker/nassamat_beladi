const connectDB = require('../src/config/database');
const app = require('../src/server');

// Ensure DB is connected before handling requests. connectDB caches connection so
// repeated invocations are cheap in serverless environments.
let ready = false;

module.exports = async (req, res) => {
  try {
    if (!ready) {
      await connectDB();
      ready = true;
    }

    // Forward the incoming request to the Express app
    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
