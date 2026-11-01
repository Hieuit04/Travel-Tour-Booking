const moment = require('moment');
const Order = require('../../models/order.model');
const City = require('../../models/city.model');
const variableConfig = require('../../configs/variable.config');

// [GET] /my-orders
module.exports.list = async (req, res) => {
  try {
    const account = res.locals.account;

    const find = {
      accountId: account.id,
      deleted: false,
    };

    // Lọc theo trạng thái đơn hàng
    const validStatus = variableConfig.orderStatusList.map(item => item.value);
    const status = validStatus.includes(req.query.status) ? req.query.status : "";
    if (status) {
      find.status = status;
    }

    // Phân trang
    const limitItems = 5;
    let page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) page = 1;

    const totalRecord = await Order.countDocuments(find);
    const totalPages = Math.max(Math.ceil(totalRecord / limitItems), 1);
    if (page > totalPages) page = totalPages;
    const skip = (page - 1) * limitItems;

    const orderList = await Order
      .find(find)
      .sort({ createdAt: "desc" })
      .limit(limitItems)
      .skip(skip);

    // Bổ sung cityName cho các đơn cũ chưa lưu
    for (const order of orderList) {
      for (const item of order.items) {
        if (!item.cityName && item.locationForm) {
          const city = await City.findOne({ _id: item.locationForm });
          if (city) item.cityName = city.name;
        }
      }
    }

    res.render('client/pages/my-orders', {
      pageTitle: 'Đơn hàng của tôi',
      orderList: orderList,
      currentStatus: status,
      pagination: {
        page: page,
        totalPages: totalPages,
        totalRecord: totalRecord,
        skip: skip,
      },
      moment: moment,
      orderStatusList: variableConfig.orderStatusList,
      paymentMethodList: variableConfig.paymentMethodList,
      paymentStatusList: variableConfig.paymentStatusList,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
}

// [GET] /my-orders/:code
module.exports.detail = async (req, res) => {
  try {
    const order = await Order.findOne({
      code: req.params.code,
      accountId: res.locals.account.id,
      deleted: false,
    });

    if (!order) {
      res.redirect('/my-orders');
      return;
    }

    // Bổ sung cityName cho các đơn cũ chưa lưu
    for (const item of order.items) {
      if (!item.cityName && item.locationForm) {
        const city = await City.findOne({ _id: item.locationForm });
        if (city) item.cityName = city.name;
      }
    }

    res.render('client/pages/my-order-detail', {
      pageTitle: `Đơn hàng ${order.code}`,
      order: order,
      moment: moment,
      orderStatusList: variableConfig.orderStatusList,
      paymentMethodList: variableConfig.paymentMethodList,
      paymentStatusList: variableConfig.paymentStatusList,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/my-orders');
  }
}

// [PATCH] /my-orders/cancel/:code
module.exports.cancelPatch = async (req, res) => {
  try {
    const order = await Order.findOne({
      code: req.params.code,
      accountId: res.locals.account.id,
      deleted: false,
    });

    if (!order) {
      return res.json({ code: "error", message: "Đơn hàng không tồn tại!" });
    }

    if (order.status !== "initial") {
      return res.json({ code: "error", message: "Đơn hàng này không thể huỷ!" });
    }

    if (order.paymentStatus === "paid") {
      return res.json({
        code: "error",
        message: "Đơn hàng đã thanh toán, vui lòng liên hệ để được hỗ trợ huỷ và hoàn tiền!",
      });
    }

    await Order.updateOne({ _id: order.id }, {
      status: "cancel",
      updatedBy: res.locals.account.id,
    });

    res.json({ code: "success", message: "Huỷ đơn hàng thành công!" });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Có lỗi xảy ra, vui lòng thử lại!" });
  }
}
