const mongoose = require('mongoose');
const dns = require('dns').promises;

let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    const msg = 'MONGO_URI is missing';
    console.error('❌', msg);
    throw new Error(msg);
  }

  const dbName = process.env.DB_NAME || 'nassamatbeladi';

  if (!cached.promise) {
    // Perform a quick DNS/SRV check (helpful for mongodb+srv URIs) and a host lookup
    (async () => {
      try {
        let hostForLog = 'unknown-host';
        try {
          const withoutCreds = uri.replace(/\/\/.*@/, '//');
          const u = new URL(withoutCreds);
          hostForLog = u.host;
        } catch (parseErr) {
          const m = uri.match(/\/\/(?:.*@)?([^/]+)/);
          hostForLog = m ? m[1] : hostForLog;
        }

        console.log('🔎 DB diagnostic: attempting DNS resolution for', hostForLog);
        if (uri.startsWith('mongodb+srv://')) {
          try {
            const srvName = `_mongodb._tcp.${hostForLog}`;
            const srv = await dns.resolveSrv(srvName);
            console.log('   SRV records:', srv.map(r => `${r.name}:${r.port}`).join(', '));
          } catch (srvErr) {
            console.error('   SRV resolution failed:', srvErr && srvErr.message ? srvErr.message : srvErr);
          }
        }

        try {
          // Do an A/AAAA lookup for host to ensure DNS resolves
          const parts = hostForLog.split(':')[0];
          const addrs = await dns.lookup(parts, { all: true });
          console.log('   DNS lookup results:', addrs.map(a => a.address).join(', '));
        } catch (lookupErr) {
          console.error('   DNS lookup failed:', lookupErr && lookupErr.message ? lookupErr.message : lookupErr);
        }
      } catch (diagErr) {
        console.error('   DB diagnostic failure:', diagErr && diagErr.message ? diagErr.message : diagErr);
      }
    })();

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
      // Determine host / cluster info without exposing credentials
      let hostInfo = 'unknown-host';
      try {
        const withoutCreds = uri.replace(/\/\/.*@/, '//');
        const u = new URL(withoutCreds);
        hostInfo = u.host;
      } catch (parseErr) {
        const m = uri.match(/\/\/(?:.*@)?([^/]+)/);
        hostInfo = m ? m[1] : hostInfo;
      }

      // Log detailed error to help diagnose connection issues on Vercel
      console.error('❌ MongoDB connection error:', e && e.message ? e.message : e);
      console.error('   Host:', hostInfo);
      if (e && e.stack) {
        // Print a trimmed stack (first 6 lines) to aid debugging without flooding logs
        const stackLines = e.stack.split('\n').slice(0, 6).join('\n');
        console.error('   Stack (truncated):\n', stackLines);
      }
      cached.promise = null;
      throw e;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;