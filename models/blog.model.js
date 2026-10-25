const mongoose = require('mongoose');

// Bài viết được tạo bởi blog_automation/generate_blog.py
const schema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  tags: Array,
  avatar: String,
  content: String,
  tourId: String,
  status: String,
  createdBy: String,
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Blog = mongoose.model('Blog', schema, 'blogs');

module.exports = Blog;
