const Tour = require("../../models/tour.model")
const Category = require("../../models/category.model")
const { formatTourItem } = require("../../helpers/tour.helper")
const categoryFilter = require('../../helpers/categoryFilter.helper');

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

  // section4
  const categoryIdSection4 = res.locals.settingWebsiteInfo.categoryIdSection4;
  const categoryList = await Category.find({
    deleted: false,
  });
  const categorySection4 = await Category.findOne({
    _id: categoryIdSection4,
    deleted: false,
    status: "active",
  })
  const tourListSection4 = await Tour
    .find({
      deleted: false,
      status: "active",
      category: {
        $in: categoryFilter(categoryList, categoryIdSection4)
      }
    })
    .sort({
      position: "desc"
    })
    .limit(8);
  for (const item of tourListSection2) {
    formatTourItem(item)
  }
  // end section4
  res.render('client/pages/home.pug', {
    pageTitle: 'Trang chủ',
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    categorySection4: categorySection4,
  });
}