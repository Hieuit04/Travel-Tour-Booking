const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema(
  {
    email: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: String,
    deletedAt: Date,
    slug: {
      type: String,
      slug: "email",
      unique: true,
    },
  },
  {
    timestamps: true,
  }
)

const Contact = mongoose.model('Contact', schema, "contacts");

module.exports = Contact