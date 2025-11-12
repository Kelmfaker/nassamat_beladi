const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
