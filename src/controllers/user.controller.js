const User = require("../models/users");

// إنشاء مستخدم
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// جلب كل المستخدمين
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password"); // ما نعرض الباسورد
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// جلب مستخدم واحد
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// تحديث مستخدم
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// حذف مستخدم
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
