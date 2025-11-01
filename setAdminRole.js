const mongoose = require("mongoose");
const User = require("./src/models/users"); // Adjust the path as necessary

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await User.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
    console.log("Admin role updated successfully.");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    mongoose.connection.close();
  });