const moment = require("moment")

module.exports.formatTourItem = (item) => {
  item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  item.discount = item.priceAdult > 0 ? Math.ceil((item.priceAdult - item.newPriceAdult) / item.priceAdult * 100) : 0;
}