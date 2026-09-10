const Category = require('../../models/category.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const buildCategoryTree = require('../../helpers/categoryTree.helper');
const moment = require('moment');
module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  }
  // Lọc theo trạng thái
  if (req.query.status) {
    find.status = req.query.status;
  }
  // End Lọc theo trạng thái
  // Lọc theo người tạo
  if (req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }
  // End Lọc theo người tạo
  // Lọc theo ngày tạo
  if (req.query.startDate) {
    find.createdAt = {
      $gte : new Date(req.query.startDate),
    }
  }
  if (req.query.endDate) {
    const endDate = new Date(req.query.endDate); // Ngày kết thúc
    find.createdAt = {
      ...find.createdAt,
      $lte: new Date(endDate.setUTCHours(23, 59, 59, 999)),
    }
  }
  // End Lọc theo ngày tạo
  const categoryList = await Category
    .find(find)
    .sort({
      position: "desc"
    })
    ;
  for (const item of categoryList) {
    if (item.createdBy) {
      const createdBy = await AccountAdmin.findById(item.createdBy);
      item.createdByName = createdBy ? createdBy.fullName : "";
      item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    }
    if (item.updatedBy) {
      const updatedBy = await AccountAdmin.findById(item.updatedBy);
      item.updatedByName = updatedBy ? updatedBy.fullName : "";
      item.updatedAtFormat = moment(item.updateAt).format("HH:mm - DD/MM/YYYY");
    }
  }
  const accountList = await AccountAdmin.find({});
  res.render('admin/pages/category-list', {
    pageTitle: 'Danh sách danh mục',
    categoryList: categoryList,
    accountList: accountList,
  });
}

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });
  const categoryTree = buildCategoryTree(categoryList, "");
  res.render('admin/pages/category-create', {
    pageTitle: 'Tạo mới danh mục',
    categoryTree: categoryTree,
  });
}

module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    }
    else {
      const recordPositionMax = await Category
        .findOne({})
        .sort({
          position: "desc"
        })
      if (recordPositionMax) {
        req.body.position = recordPositionMax.position + 1;
      }
      else {
        req.body.position = 1;
      }
    }
    req.body.avatar = req.file ? req.file.path : "";
    req.body.createdBy = res.locals.account.id;
    const newRecord = new Category(req.body);
    await newRecord.save();
    res.json({
      code: "success",
      message: "Danh mục đã được tạo thành công",
    })
  } catch (error) {
    console.log("===> LỖI CREATE POST:", error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryDetail = await Category.findById(id);
    if (!categoryDetail) {
      res.redirect('/${pathAdmin}/category/list');
      return;
    }
    const categoryList = await Category.find({
      deleted: false,
    });
    const categoryTree = buildCategoryTree(categoryList, "");
    res.render('admin/pages/category-edit', {
      pageTitle: 'Sửa danh mục',
      categoryTree: categoryTree,
      categoryDetail: categoryDetail,
    });
  } catch {
    console.log(error)
    res.redirect('/${pathAdmin}/category/list');
  }
}

module.exports.editPatch = async (req, res) => {

  try {
    const id = req.params.id;
    const categoryDetail = await Category.findById(id);
    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Danh mục không tồn tại!",
      })
      return;
    }
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    }
    else {
      const recordPositionMax = await Category
        .findOne({})
        .sort({
          position: "desc"
        })
      if (recordPositionMax) {
        req.body.position = recordPositionMax.position + 1;
      }
      else {
        req.body.position = 1;
      }
    }
    req.body.avatar = req.file ? req.file.path : "";
    req.body.updatedBy = res.locals.account.id;
    await Category.updateOne({
      _id: id
    }, req.body)
    res.json({
      code: "success",
      message: "Danh mục đã được cập nhật thành công",
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryDetail = await Category.findById(id);
    if (!categoryDetail) {
      res.json({
        code: "error",
        message: "Danh mục không tồn tại!",
      })
      return;
    }
    
    await Category.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedBy: res.locals.account.id, 
      deletedAt: new Date()
    })
    res.json({
      code: "success",
      message: "Đã xoá danh mục!",
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

