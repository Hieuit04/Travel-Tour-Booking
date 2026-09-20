const SettingWebsiteInfo = require('../../models/setting-website-info.model');
const { permissionList } = require('../../configs/variable.config');
const Role = require('../../models/role.model');


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

module.exports.accountAdminList = (req, res) => {
  res.render('admin/pages/setting-account-admin-list', {
    pageTitle: 'Tài khoản quản trị',
  });
};

module.exports.accountAdminCreate = (req, res) => {
  res.render('admin/pages/setting-account-admin-create', {
    pageTitle: 'Tạo tài khoản quản trị',
  });
};

module.exports.roleList = async (req, res) => {
  const settingRoleList = await Role.find({ deleted: false });
  console.log(settingRoleList);
  res.render('admin/pages/setting-role-list', {
    pageTitle: 'Nhóm quyền',
    settingRoleList: settingRoleList
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

module.exports.edit = async (req, res) => {
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

module.exports.editPatch = async (req, res) => {
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

