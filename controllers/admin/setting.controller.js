const SettingWebsiteInfo = require('../../models/setting-website-info.model');
const { permissionList } = require('../../configs/variable.config');
const bcrypt = require('bcryptjs');
const Role = require('../../models/role.model');
const slugify = require('slugify');
const AccountAdmin = require('../../models/accounts-admin.model');

module.exports.list = async (req, res) => {

  res.render('admin/pages/setting-list', {
    pageTitle: 'Cài đặt chung',
  });
};

module.exports.websiteInfo = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({})
  res.render('admin/pages/setting-website-info', {
    pageTitle: 'Thông tin website',
    settingWebsiteInfo: settingWebsiteInfo,
  });
};

module.exports.websiteInfoPatch = async (req, res) => {
  console.log(req.files);
  req.body.logo = req.files.logo ? req.files.logo[0].path : "";
  req.body.favicon = req.files.favicon ? req.files.favicon[0].path : "";
  await SettingWebsiteInfo.findOneAndUpdate({}, req.body, { upsert: true });
  res.json({
    code: "success",
    message: "Thông tin Website đã được cập nhật thành công",
  })
};

module.exports.accountAdminList = async (req, res) => {
  const find = {
    deleted: false,
  }
  const accountAdminList = await AccountAdmin.find(find);
  const roleList = await Role.find(find);
  for (const item of accountAdminList) {
    if (item.role) {
      const roleInfo = roleList.find(r => r.id.toString() === item.role.toString());
      item.roleName = roleInfo ? roleInfo.roleName : "";
    }
  }
  res.render('admin/pages/setting-account-admin-list', {
    pageTitle: 'Tài khoản quản trị',
    accountAdminList: accountAdminList,
  });
};

module.exports.accountAdminCreate = async (req, res) => {
  const roleList = await Role.find({
    deleted: false,
  });
  res.render('admin/pages/setting-account-admin-create', {
    pageTitle: 'Tạo tài khoản quản trị',
    roleList: roleList,
  });
};

module.exports.accountAdminCreatePost = async (req, res) => {
  try {
    const exisitEmail = await AccountAdmin.findOne({
      email: req.body.email,
    });
    if (exisitEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại!"
      })
      return;
    }
    const exisitPhone = await AccountAdmin.findOne({
      phone: req.body.phone,
    });
    if (exisitPhone) {
      res.json({
        code: "error",
        message: "Số điện thoại đã tồn tại!"
      })
      return;
    }
    const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên 10 ký tự 
    req.body.passWord = await bcrypt.hash(req.body.passWord, salt); // Hash mật khẩu
    req.body.avatar = req.file ? req.file.path : "";
    req.body.createdBy = res.locals.account.id;
    const newRecord = new AccountAdmin(req.body);
    await newRecord.save();
    res.json({
      code: "success",
      message: "Tài khoản quản trị đã được tạo thành công",
    })
  } catch (error) {
    console.log("===> LỖI CREATE POST:", error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}



module.exports.roleList = async (req, res) => {
  const find = {
    deleted: false,
  }
  // Tìm kiếm
  if (req.query.keyword) {
    const slug = slugify(req.query.keyword, {
      lower: true,
    });
    const regex = new RegExp(slug, "i");
    find.slug = regex;
  }
  // End Tìm kiếm
  // Phân trang 
  const limit = 3;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limit
  const totalRecord = await Role.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
  }
  // End Phân trang 
  const settingRoleList = await Role
    .find(find)
    .skip(skip)
    .limit(limit)
    .sort({
      createdAt: "desc"
    })
    ;

  console.log(settingRoleList);
  res.render('admin/pages/setting-role-list', {
    pageTitle: 'Nhóm quyền',
    settingRoleList: settingRoleList,
    pagination: pagination,
  });
};

module.exports.roleCreate = (req, res) => {
  res.render('admin/pages/setting-role-create', {
    pageTitle: 'Tạo nhóm quyền',
    permissionList: permissionList,
  });
};

module.exports.roleCreatePost = async (req, res) => {
  try {
    req.body.createdBy = res.locals.account.id;
    const newRecord = new Role(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Nhóm quyền đã được tạo thành công",
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    })
  }
};

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;
    const roleDetail = await Role.findById(id);
    if (!roleDetail) {
      res.json({
        code: "error",
        message: "Nhóm quyền không tồn tại!"
      })
      res.redirect(`/${pathAdmin}/setting/role/list`);
      return;
    }
    res.render('admin/pages/setting-role-edit', {
      pageTitle: 'Sửa thông tin nhóm quyền',
      roleDetail: roleDetail,
      permissionList: permissionList,
    });
  } catch (error) {
    console.log(error)
    res.redirect('/${pathAdmin}/setting/role/list');
  }
}

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const roleDetail = await Role.findById(id);
    if (!roleDetail) {
      res.json({
        code: "error",
        message: "Nhóm quyền không tồn tại!"
      })
      res.redirect(`/${pathAdmin}/setting/role/list`);
      return;
    }
    await Role.findByIdAndUpdate(id, req.body);
    res.json({
      code: "success",
      message: "Nhóm quyền đã được cập nhật thành công",
    })
  } catch (error) {
    console.log(error)
    res.redirect('/${pathAdmin}/setting/role/list');
  }
}

module.exports.roleDeletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    const roleDetail = await Role.findById(id);
    if (!roleDetail) {
      res.json({
        code: "error",
        message: "Nhóm quyền không tồn tại!",
      })
      return;
    }

    await Role.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedBy: res.locals.account.id,
      deletedAt: new Date()
    })
    res.json({
      code: "success",
      message: "Đã xoá nhóm quyền thành công!",
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.roleChangeMultiPatch = async (req, res) => {
  try {
    const adminId = res.locals.account.id;
    const { listId, option } = req.body;
    switch (option) {
      case "delete":
        await Role.updateMany({
          _id: {
            $in: listId
          }
        }, {
          deleted: true,
          deletedBy: adminId,
          deletedAt: Date.now(),
        })
        res.json({
          code: 'success',
          message: 'Xoá nhóm quyền thành công!'
        })
        break;
      default:
        res.json({
          code: 'error',
          message: 'Hành động không hợp lệ!'
        })
        break;
    }

  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

