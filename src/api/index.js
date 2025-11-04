const connectDB = require('../src/config/database');
const app = require('../src/server');

let ready = false;

export default async function handler(req, res) {
  try {
    if (!ready) {
      await connectDB();
      ready = true;
    }

    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
