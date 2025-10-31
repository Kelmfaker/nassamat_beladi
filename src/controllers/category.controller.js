const Category = require("../models/category");

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.render("pages/categories", { categories });
  } catch (err) {
    console.error("Error in getAllCategories:", err);
    res.render("pages/categories", { categories: [] });
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).send('اسم القسم مطلوب');
    }
    
    const newCategory = new Category({ name: name.trim() });
    await newCategory.save();
    res.redirect("/admin/categories");
  } catch (err) {
    console.error("Error in createCategory:", err);
    if (err.code === 11000) {
      res.status(400).send('هذا القسم موجود بالفعل');
    } else {
      res.status(500).send('خطأ في إضافة القسم');
    }
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).send('اسم القسم مطلوب');
    }
    
    const category = await Category.findByIdAndUpdate(
      id, 
      { name: name.trim() }, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).send('القسم غير موجود');
    }
    
    res.redirect("/admin/categories");
  } catch (err) {
    console.error("Error in updateCategory:", err);
    res.status(500).send('خطأ في تعديل القسم');
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).send('القسم غير موجود');
    }
    
    res.redirect("/admin/categories");
  } catch (err) {
    console.error("Error in deleteCategory:", err);
    res.status(500).send('خطأ في حذف القسم');
  }
};
