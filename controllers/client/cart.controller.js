const Tour = require('../../models/tour.model');
const moment = require('moment');
const City = require('../../models/city.model');

module.exports.cart = (req, res) => {
  res.render('client/pages/cart', {
    pageTitle: 'Giỏ hàng',
  });
}

module.exports.detailPost = async (req, res) => {
  try {
    const cart = req.body;
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.json({
        code: "success",
        message: "Giỏ hàng rỗng",
        cartDetail: []
      });
    }
    const cartDetail = [];
    for (const item of cart) {
      const tourDetail = await Tour.findOne({
        _id: item.tourId,
        status: "active",
        deleted: false,
      });
      if (tourDetail) {
        const city = await City.findOne({
          _id: item.locationForm,
        });
        const itemDetail = {
          ...item,
          detail: {
            avatar: tourDetail.avatar,
            tourName: tourDetail.tourName,
            slug: tourDetail.slug,
            departureDate: moment(tourDetail.departureDate).format("DD/MM/YYYY"),
            cityName: city.name,
            stockAdult: tourDetail.stockAdult,
            stockChildren: tourDetail.stockChildren,
            stockBaby: tourDetail.stockBaby,
            newPriceAdult: tourDetail.newPriceAdult,
            newPriceChildren: tourDetail.newPriceChildren,
            newPriceBaby: tourDetail.newPriceBaby,
          }
        }
        cartDetail.push(itemDetail);
      }
    }
    res.json({
      code: "success",
      message: "Thành công",
      cartDetail: cartDetail,
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ"
    })
  }
}