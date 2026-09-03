const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
  vehicle: String
});

const Tour = mongoose.model('Tour', schema, 'tours');

module.exports = Tour;