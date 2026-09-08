const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: String,
  email: String,
  passWord: String,
  status: String,
},{timestamps: true});

const AccountAdmin = mongoose.model('AccountAdmin', schema, 'accounts-admin');

module.exports = AccountAdmin;