const mongoose = require('mongoose');

let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing');

  const dbName = process.env.DB_NAME || 'nassamatbeladi';

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName,
      // Increase timeouts for serverless cold starts / remote DB latency
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      appName: 'nassamat-beladi',
      bufferCommands: false,
    }).then((m) => {
      console.log(`✅ MongoDB connected (db: ${dbName})`);
      return m;
    }).catch((e) => {
      // Log detailed error to help diagnose connection issues on Vercel
      console.error('❌ MongoDB connection error:', e && e.message ? e.message : e);
      cached.promise = null;
      throw e;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;