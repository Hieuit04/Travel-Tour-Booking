const { randomNumberString } = require('../../helpers/generate.helper');
const Order = require('../../models/order.model');
const Tour = require('../../models/tour.model');
module.exports.createPost = async (req, res) => { 
  try {
    // mã đơn hàng
    while (true) {
      req.body.code = `OD${randomNumberString(8)}`
      const existOrder = await Order.findOne({ code :req.body.code });
      if (!existOrder) break;
    }
     req.body.subTotal = 0;
    // Danh sách tour 
    for (const item of req.body.items) {
      const tourDetail = await Tour.findOne({ _id: item.tourId });
      if (!tourDetail) {
        return res.json({
          code: "error",
          message : "Tour không tồn tại",
        })
      }
      item.avatar = tourDetail.avatar;
      item.tourName= tourDetail.tourName;
      item.slug = tourDetail.slug;
      item.newPriceAdult = tourDetail.newPriceAdult;
      item.newPriceChildren = tourDetail.newPriceChildren;
      item.newPriceBaby = tourDetail.newPriceBaby;
      item.departureDate = tourDetail.departureDate;
      req.body.subTotal += (item.newPriceAdult * item.quantityAdult) + (item.newPriceChildren * item.quantityChildren) + (item.newPriceBaby * item.quantityBaby);
    }
    req.body.discount = 0;
    req.body.total = req.body.subTotal - req.body.discount;
    req.body.paymentStatus = "unpaid";
    req.body.status = "initial";
    
    const order = new Order(req.body);
    await order.save(); 

    res.json({
      code: "success",
      message: "Đặt hàng thành công",
      orderCode : req.body.code,
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message : "Dữ liệu không hợp lệ",
    })
  }
} 