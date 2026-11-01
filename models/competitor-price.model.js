const mongoose = require('mongoose');

// Ghi bởi price_scraper/scrape_prices.py, web chỉ đọc
const schema = new mongoose.Schema({
  source: String,
  url: String,
  tour_name: String,
  destination: String,
  departure_city: String,
  duration_days: Number,
  duration_nights: Number,
  departure_date: String,
  price_adult: Number,
  original_price: Number,
  seats_left: Number,
  scraped_at: Date,
});

const CompetitorPrice = mongoose.model('CompetitorPrice', schema, 'competitor_prices');

module.exports = CompetitorPrice;
