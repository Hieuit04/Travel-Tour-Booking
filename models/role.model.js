const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);   

const schema = new mongoose.Schema({
  roleName: String,
  description: String,
  rolePermissions: Array,
  slug: {                    
    type: String,
    slug: "roleName",      
    unique: true,
  },
  createdBy: String,
  updatedBy: String,
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: String,
  deletedAt: Date,
},{timestamps: true});

const Role = mongoose.model('Role', schema, 'roles');

module.exports = Role;