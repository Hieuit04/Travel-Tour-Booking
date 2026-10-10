const Order = require('../../models/order.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const moment = require('moment');
const variableConfig = require('../../configs/variable.config');
const { checkPermission } = require('../../helpers/permission.helper');

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Lọc theo trạng thái đơn hàng
  if (req.query.status) {
    find.status = req.query.status;
  }

  // Lọc theo trạng thái thanh toán
  if (req.query.paymentStatus) {
    find.paymentStatus = req.query.paymentStatus;
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

  // Tìm kiếm theo mã đơn hàng hoặc SĐT
  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.$or = [
      { code: regex },
      { fullName: regex }
    ];
  }

  // Phân trang
  const limit = 10;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limit;
  const totalRecord = await Order.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
  };

  const orderList = await Order
    .find(find)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: "desc" });

  res.render('admin/pages/order-list', {
    pageTitle: 'Danh sách đơn hàng',
    orderList: orderList,
    pagination: pagination,
    moment: moment,
    orderStatusList: variableConfig.orderStatusList,
    paymentStatusList: variableConfig.paymentStatusList,
    paymentMethodList: variableConfig.paymentMethodList,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const orderDetail = await Order.findById(id);
    if (!orderDetail) {
      res.redirect(`/${variableConfig.pathAdmin}/order/list`);
      return;
    }
    
    res.render('admin/pages/order-edit', {
      pageTitle: `Đơn hàng: ${orderDetail.code}`,
      orderDetail: orderDetail,
      moment: moment,
      orderStatusList: variableConfig.orderStatusList,
      paymentStatusList: variableConfig.paymentStatusList,
      paymentMethodList: variableConfig.paymentMethodList,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${variableConfig.pathAdmin}/order/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    let adminId = "";
    if (res.locals.account) {
      adminId = res.locals.account.id;
    }
    
    await Order.findByIdAndUpdate(id, {
      ...req.body,
      updatedBy: adminId
    });

    res.json({
      code: "success",
      message: "Cập nhật đơn hàng thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Cập nhật thất bại",
    });
  }
};

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    let adminId = "";
    if (res.locals.account) {
      adminId = res.locals.account.id;
    }

    await Order.findByIdAndUpdate(id, {
      deleted: true,
      deletedBy: adminId,
      deletedAt: new Date()
    });

    res.json({
      code: "success",
      message: "Đã xóa đơn hàng",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};

module.exports.changeMultiPatch = async (req, res) => {
  try {
    let adminId = "";
    if (res.locals.account) {
      adminId = res.locals.account.id;
    }
    const { listId, option } = req.body;

    const isValidStatus = variableConfig.orderStatusList.some(item => item.value === option);

    if (isValidStatus) {
      if (!checkPermission(res, "order-edit")) return;
      await Order.updateMany(
        { _id: { $in: listId } },
        { 
          status: option,
          updatedBy: adminId
        }
      );
      res.json({
        code: "success",
        message: "Cập nhật trạng thái thành công"
      });
    } else if (option === "delete") {
      if (!checkPermission(res, "order-delete")) return;
      await Order.updateMany(
        { _id: { $in: listId } },
        {
          deleted: true,
          deletedBy: adminId,
          deletedAt: new Date()
        }
      );
      res.json({
        code: "success",
        message: "Đã xóa các đơn hàng đã chọn"
      });
    } else {
      res.json({
        code: "error",
        message: "Hành động không hợp lệ"
      });
    }

  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};
