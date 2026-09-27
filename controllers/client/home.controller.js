const Tour = require("../../models/tour.model")
const {formatTourItem} = require("../../helpers/tour.helper")


module.exports.home = async (req, res) => {
  // section2
  const tourListSection2 = await Tour
    .find({
      deleted: false,
      status: "active",
      // featured:"1"
    })
    .sort({
      position: "desc"
    })
    .limit(6);
  for (const item of tourListSection2) {
    formatTourItem(item)
  }
  // end section2
  res.render('client/pages/home.pug', {
    pageTitle: 'Trang chủ',
    tourListSection2 : tourListSection2,
  });
}