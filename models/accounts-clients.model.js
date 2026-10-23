const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: {type: String, default: null},
  status: String,
  passWord: String,
  avatar: String,
  googleId: { type: String, unique: true, sparse: true},
  authType: { type: String, enum: ["local", "google"], default: "local"},
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "fullName",
    unique: true,
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: String,
}, { timestamps: true });

const AccountClient = mongoose.model('AccountClient', schema, 'accounts-clients');

module.exports = AccountClient;