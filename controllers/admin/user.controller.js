const AccountClient = require('../../models/accounts-clients.model');
const moment = require('moment');
const variableConfig = require('../../configs/variable.config');
const { checkPermission } = require('../../helpers/permission.helper');

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Lọc theo trạng thái tài khoản
  if (req.query.status) {
    find.status = req.query.status;
  }

  // Lọc theo phương thức đăng nhập / loại tài khoản
  if (req.query.authType) {
    find.authType = req.query.authType;
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

  // Tìm kiếm theo Họ tên, Email hoặc Số điện thoại
  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.$or = [
      { fullName: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  // Phân trang
  const limit = 10;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limit;
  const totalRecord = await AccountClient.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
    currentPage: page,
  };

  const userList = await AccountClient
    .find(find)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: "desc" });

  res.render('admin/pages/user-list', {
    pageTitle: 'Quản lý thông tin khách hàng',
    userList: userList,
    pagination: pagination,
    moment: moment,
    userStatusList: variableConfig.userStatusList,
  });
};

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const userDetail = await AccountClient.findById(id);
    if (!userDetail) {
      res.redirect(`/${variableConfig.pathAdmin}/user/list`);
      return;
    }

    res.render('admin/pages/user-edit', {
      pageTitle: `Khách hàng: ${userDetail.fullName}`,
      userDetail: userDetail,
      moment: moment,
      userStatusList: variableConfig.userStatusList,
    });
  } catch (error) {
    console.log(error);
    res.redirect(`/${variableConfig.pathAdmin}/user/list`);
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    let adminId = "";
    if (res.locals.account) {
      adminId = res.locals.account.id;
    }

    const { fullName, phone, status } = req.body;

    await AccountClient.findByIdAndUpdate(id, {
      fullName,
      phone,
      status,
      updatedBy: adminId,
    });

    res.json({
      code: "success",
      message: "Cập nhật thông tin khách hàng thành công",
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

    await AccountClient.findByIdAndUpdate(id, {
      status: "inactive",
      deleted: true,
      deletedBy: adminId,
      deletedAt: new Date(),
    });

    res.json({
      code: "success",
      message: "Đã xóa khách hàng",
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

    const isValidStatus = variableConfig.userStatusList.some(item => item.value === option);

    if (isValidStatus) {
      if (!checkPermission(res, "user-edit")) return;
      await AccountClient.updateMany(
        { _id: { $in: listId } },
        {
          status: option,
          updatedBy: adminId,
        }
      );
      res.json({
        code: "success",
        message: "Cập nhật trạng thái thành công",
      });
    } else if (option === "delete") {
      if (!checkPermission(res, "user-delete")) return;
      await AccountClient.updateMany(
        { _id: { $in: listId } },
        {
          deleted: true,
          deletedBy: adminId,
          deletedAt: new Date(),
        }
      );
      res.json({
        code: "success",
        message: "Đã xóa các tài khoản khách hàng đã chọn",
      });
    } else {
      res.json({
        code: "error",
        message: "Hành động không hợp lệ",
      });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    });
  }
};
