const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema({
  categoryName: String,
  parent: String,
  position: Number,
  status: String,
  avatar: String,
  description: String,
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "categoryName",
    unique: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: String,

},{timestamps: true});

const Category = mongoose.model('Category', schema, 'categories');

module.exports = Category;
