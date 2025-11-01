require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/users'); // adjust if your model path/name differs

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@example.com';
    const name = 'Admin';
    const password = 'Admin@12345'; // change after first login

    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({ name, email, password, role: 'admin' }); // pre-save hashes password
      console.log('Created admin:', u.email);
    } else {
      u.role = 'admin';
      await u.save();
      console.log('Promoted to admin:', u.email);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();