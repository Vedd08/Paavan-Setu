const mongoose = require('mongoose');

// A category belongs to one shelf language. On the Books page, the English and
// Gujarati tabs each list their own categories as sub-categories; 'All' shows
// the category under both tabs.
const CATEGORY_LANGUAGES = ['English', 'Gujarati', 'All'];

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
  },
  language: {
    type: String,
    enum: CATEGORY_LANGUAGES,
    default: 'All',
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  color: {
    type: String,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Non-latin names (Gujarati) strip down to an empty string, so fall back to the
// id — otherwise every Gujarati category would collide on an empty slug.
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    const base = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.slug = base ? `${this.language.toLowerCase()}-${base}` : `category-${this._id}`;
  }
  next();
});

// The same name may exist once per language ("Mythology" in English and in
// Gujarati), so uniqueness is scoped to the language.
categorySchema.index({ language: 1, name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });
categorySchema.index({ isActive: 1, order: 1 });

const Category = mongoose.model('Category', categorySchema);
Category.LANGUAGES = CATEGORY_LANGUAGES;

module.exports = Category;
