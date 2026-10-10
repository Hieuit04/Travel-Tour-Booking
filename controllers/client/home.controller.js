const Tour = require("../../models/tour.model")
const Category = require("../../models/category.model")
const { formatTourItem } = require("../../helpers/tour.helper")
const categoryFilter = require('../../helpers/categoryFilter.helper');

const Promotion = require("../../models/promotion.model");

module.exports.home = async (req, res) => {
  // section2 (Promotion)
  const now = new Date();
  
  // 1. Tìm promotion đang diễn ra (ưu tiên sắp kết thúc)
  let promotion = await Promotion.findOne({
    deleted: false,
    status: 'active',
    timeStart: { $lte: now },
    timeEnd: { $gte: now }
  }).sort({ timeEnd: 1 });

  let isUpcoming = false;

  // 2. Nếu không có cái nào đang diễn ra, tìm cái sắp diễn ra gần nhất
  if (!promotion) {
    promotion = await Promotion.findOne({
      deleted: false,
      status: 'active',
      timeStart: { $gt: now }
    }).sort({ timeStart: 1 });
    if (promotion) {
      isUpcoming = true;
    }
  }

  let tourListSection2 = [];
  if (promotion) {
    // Lấy tối đa 6 tour trong promotion này
    const products = promotion.products.slice(0, 6);
    const tourIds = products.map(p => p.tourId);
    
    // Lấy thông tin các tour
    const tours = await Tour.find({
      _id: { $in: tourIds },
      deleted: false,
      status: 'active'
    });

    for (const product of products) {
      let tour = tours.find(t => t.id === product.tourId.toString());
      if (tour) {
        tour.newPriceAdult = product.specialPriceAdult;
        tourListSection2.push(tour);
      }
    }
  } else {
    // Fallback: nếu không có promotion nào, lấy tour nổi bật như cũ
    tourListSection2 = await Tour.find({
      deleted: false,
      status: "active"
    }).sort({ position: "desc" }).limit(6);
  }

  for (const item of tourListSection2) {
    formatTourItem(item);
    
    // Nếu là upcoming promotion, che giấu giá và % giảm
    if (promotion && isUpcoming) {
      item.discountString = "??"; 
      const priceStr = item.newPriceAdult.toLocaleString("vi-VN");
      item.newPriceAdultString = priceStr.replace(/\d/g, (match, offset) => offset === 0 ? match : '?');
    }
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
  for (const item of tourListSection4) {
    formatTourItem(item)
  }
  // end section4

  // section6
  const categoryIdSection6 = res.locals.settingWebsiteInfo.categoryIdSection6;
  let categorySection6 = null;
  if (categoryIdSection6) {
    categorySection6 = await Category.findOne({
      _id: categoryIdSection6,
      deleted: false,
      status: "active",
    });
  }
  let tourListSection6 = [];
  if (categoryIdSection6) {
    tourListSection6 = await Tour
      .find({
        deleted: false,
        status: "active",
        category: {
          $in: categoryFilter(categoryList, categoryIdSection6)
        }
      })
      .sort({
        position: "desc"
      })
      .limit(8);
    for (const item of tourListSection6) {
      formatTourItem(item)
    }
  }
  // end section6

  res.render('client/pages/home.pug', {
    pageTitle: 'Trang chủ',
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    categorySection4: categorySection4,
    tourListSection6: tourListSection6,
    categorySection6: categorySection6,
    promotion: promotion,
    isUpcoming: isUpcoming,
  });
}