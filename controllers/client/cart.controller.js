const Tour = require('../../models/tour.model.js');
const moment = require('moment');
const City = require('../../models/city.model.js');
const { itemAmount, findCouponDiscount } = require('../../helpers/order.helper');

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

// [POST] /cart/coupon: xem trước số tiền giảm, /order/create tính lại khi đặt
module.exports.couponPost = async (req, res) => {
  try {
    const { coupon, items } = req.body;
    const lines = [];
    for (const item of items) {
      const tourDetail = await Tour.findOne({ _id: String(item.tourId), status: "active", deleted: false });
      if (tourDetail) lines.push({ tourId: tourDetail.id, amount: itemAmount(item, tourDetail) });
    }
    const discount = await findCouponDiscount(coupon, lines);
    if (!discount) {
      return res.json({ code: "error", message: "Mã giảm giá không hợp lệ hoặc không áp dụng cho tour đã chọn!" });
    }
    res.json({ code: "success", discount: discount });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
  }
}
