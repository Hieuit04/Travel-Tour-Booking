const Category = require('../../models/category.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const buildCategoryTree = require('../../helpers/categoryTree.helper');
const moment = require('moment');
module.exports.list = async (req, res) => {
  const categoryList = await Category
    .find({})
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
  res.render('admin/pages/category-list', {
    pageTitle: 'Danh sách danh mục',
    categoryList: categoryList,
  });
}

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({});
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
