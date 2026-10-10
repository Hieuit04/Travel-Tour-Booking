const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  nameWebsite: String,
  phone: String,
  email: String,
  address: String,
  logo: String,
  favicon: String,
  categoryIdSection4: String,
  categoryIdSection6: String,
},{timestamps: true});

const SettingWebsiteInfo = mongoose.model('SettingWebsiteInfo', schema, 'setting-website-info');

module.exports = SettingWebsiteInfo;