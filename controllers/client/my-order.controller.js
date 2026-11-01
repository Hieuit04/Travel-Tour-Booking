const moment = require('moment');
const Order = require('../../models/order.model');
const City = require('../../models/city.model');
const variableConfig = require('../../configs/variable.config');

// [GET] /my-orders
module.exports.list = async (req, res) => {
  try {
    const account = res.locals.account;

    const find = {
      $or: [
        { accountId: account.id },
        { acccountId: account.id }
      ],
      deleted: false,
    };

    // Lọc theo trạng thái đơn hàng
    if (req.query.status) {
      find.status = req.query.status;
    }

    // Lọc theo phương thức thanh toán
    if (req.query.paymentMethod) {
      find.paymentMethod = req.query.paymentMethod;
    }

    // Lọc theo ngày tạo
    if (req.query.startDate) {
      find.createdAt = {
        $gte: new Date(req.query.startDate),
      };
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      find.createdAt = {
        ...find.createdAt,
        $lte: new Date(endDate.setUTCHours(23, 59, 59, 999)),
      };
    }

    // Tìm kiếm theo mã đơn hàng
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      find.code = regex;
    }

    // Phân trang
    const limit = 10;
    let page = 1;
    if (req.query.page && parseInt(req.query.page) > 0) {
      page = parseInt(req.query.page);
    }
    const skip = (page - 1) * limit;

    const totalRecord = await Order.countDocuments(find);
    const totalPages = Math.ceil(totalRecord / limit) || 1;
    const pagination = {
      totalPages: totalPages,
      totalRecord: totalRecord,
      skip: skip,
      page: page,
    };

    const orderList = await Order
      .find(find)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit);

    // Bổ sung cityName cho các đơn cũ chưa lưu
    for (const order of orderList) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (!item.cityName && item.locationForm) {
            const city = await City.findOne({ _id: item.locationForm });
            if (city) item.cityName = city.name;
          }
        }
      }
    }

    res.render('client/pages/my-orders', {
      pageTitle: 'Đơn hàng của tôi',
      orderList: orderList,
      pagination: pagination,
      moment: moment,
      orderStatusList: variableConfig.orderStatusList,
      paymentMethodList: variableConfig.paymentMethodList,
      paymentStatusList: variableConfig.paymentStatusList,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
};

// [GET] /my-orders/:code
module.exports.detail = async (req, res) => {
  try {
    const order = await Order.findOne({
      code: req.params.code,
      $or: [
        { accountId: res.locals.account.id },
        { acccountId: res.locals.account.id }
      ],
      deleted: false,
    });

    if (!order) {
      res.redirect('/my-orders');
      return;
    }

    // Bổ sung cityName cho các tour trong đơn
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (!item.cityName && item.locationForm) {
          const city = await City.findOne({ _id: item.locationForm });
          if (city) item.cityName = city.name;
        }
      }
    }

    res.render('client/pages/my-order-detail', {
      pageTitle: `Đơn hàng: ${order.code}`,
      orderDetail: order,
      moment: moment,
      orderStatusList: variableConfig.orderStatusList,
      paymentMethodList: variableConfig.paymentMethodList,
      paymentStatusList: variableConfig.paymentStatusList,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/my-orders');
  }
};

// [PATCH] /my-orders/cancel/:code
module.exports.cancelPatch = async (req, res) => {
  try {
    const order = await Order.findOne({
      code: req.params.code,
      $or: [
        { accountId: res.locals.account.id },
        { acccountId: res.locals.account.id }
      ],
      deleted: false,
    });

    if (!order) {
      return res.json({ code: "error", message: "Đơn hàng không tồn tại!" });
    }

    // Chỉ được hủy khi đơn hàng ở trạng thái khởi tạo
    if (order.status !== "initial") {
      return res.json({ 
        code: "error", 
        message: "Chỉ được huỷ đơn hàng khi trạng thái là khởi tạo!" 
      });
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
};
