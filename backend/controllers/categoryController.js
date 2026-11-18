const Category = require('../models/Category');
const Book = require('../models/Book');

// GET /api/categories - Public: Get active categories
exports.getPublicCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort('order')
      .select('-__v');

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// GET /api/admin/categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort('order')
      .select('-__v');

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// The slug is always derived on the server (the pre-save hook handles Gujarati
// names), so a client-sent value — often an empty string for non-latin names —
// can never collide on the unique slug index.
const EDITABLE = ['name', 'language', 'description', 'color', 'icon', 'order', 'isActive'];
const pickEditable = (body = {}) =>
  Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const duplicateMessage = (error) =>
  error?.code === 11000
    ? 'A category with this name already exists for that language'
    : null;

// POST /api/admin/categories
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(pickEditable(req.body));

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    const message = duplicateMessage(error);
    if (message) return res.status(409).json({ success: false, message });
    next(error);
  }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const previousName = category.name;
    category.set(pickEditable(req.body));
    await category.save();

    // Books store the category name alongside its id for filtering, so keep
    // them in step when a category is renamed.
    if (previousName !== category.name) {
      await Book.updateMany({ category: category._id }, { categoryName: category.name });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    const message = duplicateMessage(error);
    if (message) return res.status(409).json({ success: false, message });
    next(error);
  }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Leave the books in place, just uncategorised.
    await Book.updateMany({ category: category._id }, { $unset: { category: 1, categoryName: 1 } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
