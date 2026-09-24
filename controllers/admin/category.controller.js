const Category = require('../../models/category.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const buildCategoryTree = require('../../helpers/categoryTree.helper');
const moment = require('moment');
const slugify = require('slugify')
const {checkPermission} = require('../../helpers/permission.helper')
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
      $gte: new Date(req.query.startDate),
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
  if (req.query.page&&parseInt(req.query.page)>0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1)*limit
  const totalRecord = await Category.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
  }
  // End Phân trang 

  const categoryList = await Category
    .find(find)
    .skip(skip)
    .limit(limit)
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
    pagination: pagination,
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
      res.redirect(`/${pathAdmin}/category/list`);
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
  } catch (error){
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
    if (req.file) {
      req.body.avatar = req.file.path;
    }
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


module.exports.changeMultiPatch = async (req, res) => {
  try {
    const adminId = res.locals.account.id;
    const { listId, option } = req.body;

    console.log("===> ", adminId, listId, option)
    switch (option) {
      case "active":
      case "inactive":
        if(!checkPermission(res,"category-edit")) return;
        await Category.updateMany({
          _id: {
            $in: listId
          }
        }, {
          status: option,
          updatedBy: adminId,
        })
        res.json({
          code: 'success',
          message: 'Cập nhật danh mục thành công!'
        })
        break;
      case "delete":
        if(!checkPermission(res,"category-delete")) return;
        await Category.updateMany({
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
          message: 'Xoá danh mục thành công!'
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

