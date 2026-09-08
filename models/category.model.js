const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  categoryName: String,
  parent: String,
  position: Number,
  status: String,
  description: String,
  createdBy: String,
  updatedBy: String,
},{timestamps: true});

const Category = mongoose.model('Category', schema, 'categories');

module.exports = Category;
