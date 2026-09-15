const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater'); 
mongoose.plugin(slug);

const schema = new mongoose.Schema({
  tourName: String,
  category: String,
  position: Number,
  status: String,
  avatar: String,
  priceAdult: Number,
  priceChildren: Number,
  priceBaby: Number,
  newPriceAdult: Number,
  newPriceChildren: Number,
  newPriceBaby: Number,
  stockAdult: Number,
  stockChildren: Number,
  stockBaby: Number,
  loaction: Array,
  time: String,
  vihicle: String,
  departureDate: Date,
  information: String,
  schedule: Array,
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "tourName", 
    unique: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
  deletedAt: Date
}, {
  timestamps: true
});

const Tour = mongoose.model('Tour', schema, 'tours');

module.exports = Tour;