const Category = require('../../models/category.model');
const City = require('../../models/city.model');
const Tour = require('../../models/tour.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const moment = require('moment');
const buildCategoryTree = require('../../helpers/categoryTree.helper');
const slugify = require('slugify')


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
  // Lọc theo danh mục
  if (req.query.category) {
    find.category = req.query.category;
  }
  // End Lọc theo danh mục


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
  const totalRecord = await Tour.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
  }
  // End Phân trang 
  const tourList = await Tour
    .find(find)
    .skip(skip)
    .limit(limit)
    .sort({
      position: "desc"
    });

  for (const item of tourList) {
    if (item.createdBy) {
      const createdBy = await AccountAdmin.findById(item.createdBy);
      item.createdByName = createdBy.fullName;
      item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    }
    if (item.updatedBy) {
      const updatedBy = await AccountAdmin.findById(item.updatedBy);
      item.updatedByName = updatedBy.fullName;
      item.updatedAtFormat = moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
    }
  }
  const accountList = await AccountAdmin.find({});
  const categoryList = await Category.find({
    deleted: false,
  });
  const categoryTree = buildCategoryTree(categoryList, "");
  res.render('admin/pages/tour-list', {
    pageTitle: 'Danh sách tour',
    tourList: tourList,
    accountList: accountList,
    categoryList: categoryList,
    categoryTree: categoryTree,
    pagination: pagination,
  });
};

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false,
  });
  const categoryTree = buildCategoryTree(categoryList, "");
  const cityList = await City.find({})
  res.render('admin/pages/tour-create', {
    pageTitle: 'Tạo mới tour',
    categoryTree: categoryTree,
    cityList: cityList,
  });
};

module.exports.trash = async (req, res) => {
  const tourList = await Tour.find({
    deleted: true,
  }).sort({
    deletedAt: "desc"
  });
  for (const item of tourList) {
    if (item.createdBy) {
      const createdBy = await AccountAdmin.findById(item.createdBy);
      item.createdByName = createdBy.fullName;
      item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    }
    if (item.updatedBy) {
      const deletedBy = await AccountAdmin.findById(item.deletedBy);
      item.deletedByName = deletedBy.fullName;
      item.deletedAtFormat = moment(item.deletedAt).format('HH:mm - DD/MM/YYYY');
    }
  }

  res.render('admin/pages/tour-trash', {
    pageTitle: 'Thùng rác tour',
    tourList: tourList,
  });
};

module.exports.createPost = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    }
    else {
      const recordPositionMax = await Tour
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
    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.newPriceAdult = req.body.newPriceAdult ? parseInt(req.body.newPriceAdult) : 0;
    req.body.newPriceChildren = req.body.newPriceChildren ? parseInt(req.body.newPriceChildren) : 0;
    req.body.newPriceBaby = req.body.newPriceBaby ? parseInt(req.body.newPriceBaby) : 0;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.loaction = req.body.loaction ? JSON.parse(req.body.loaction) : [];
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    req.body.schedule = req.body.schedule ? JSON.parse(req.body.schedule) : [];
    req.body.createdBy = res.locals.account.id;


    const newRecord = new Tour(req.body);
    await newRecord.save();
    res.json({
      code: "success",
      message: "Tour đã được tạo thành công",
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
    const tourDetail = await Tour.findById(id);
    if (!tourDetail) {
      res.redirect(`/${pathAdmin}/tour/list`);
      return;
    }
    const categoryList = await Category.find({
      deleted: false,
    });
    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format('YYYY-MM-DD');

    const categoryTree = buildCategoryTree(categoryList, "");
    const cityList = await City.find({});
    res.render('admin/pages/tour-edit', {
      pageTitle: 'Sửa thông tin tour',
      categoryTree: categoryTree,
      tourDetail: tourDetail,
      cityList: cityList,
    });
  } catch (error) {
    console.log(error)
    res.redirect('/${pathAdmin}/category/list');
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const tourDetail = await Tour.findById(id);
    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!"
      })
      return;
    }
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    }
    else {
      const recordPositionMax = await Tour
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
    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.newPriceAdult = req.body.newPriceAdult ? parseInt(req.body.newPriceAdult) : 0;
    req.body.newPriceChildren = req.body.newPriceChildren ? parseInt(req.body.newPriceChildren) : 0;
    req.body.newPriceBaby = req.body.newPriceBaby ? parseInt(req.body.newPriceBaby) : 0;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.loaction = req.body.loaction ? JSON.parse(req.body.loaction) : [];
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    req.body.schedule = req.body.schedule ? JSON.parse(req.body.schedule) : [];
    req.body.updatedBy = res.locals.account.id;

    await Tour.findByIdAndUpdate(id, req.body);
    res.json({
      code: "success",
      message: "Tour đã được cập nhật thành công",
    })
  } catch (error) {
    console.log(error)
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
}

module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    const tourDetail = await Tour.findById(id);
    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
      })
      return;
    }

    await Tour.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedBy: res.locals.account.id,
      deletedAt: new Date()
    })
    res.json({
      code: "success",
      message: "Đã xoá tour!",
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

module.exports.deleteDestroyPatch = async (req, res) => {
  try {
    const id = req.params.id;
    const tourDetail = await Tour.findById(id);
    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
      })
      return;
    }

    await Tour.deleteOne({
      _id: id
    })
    res.json({
      code: "success",
      message: "Đã xoá tour!",
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
    switch (option) {
      case "active":
      case "inactive":
        await Tour.updateMany({
          _id: {
            $in: listId
          }
        }, {
          status: option,
          updatedBy: adminId,
        })
        res.json({
          code: 'success',
          message: 'Cập nhật tour thành công!'
        })
        break;
      case "delete":
        await Tour.updateMany({
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
          message: 'Xoá tour thành công!'
        })
        break;
      case "restore":
        await Tour.updateMany({
          _id: {
            $in: listId
          }
        }, {
          deleted: false,
        })
        res.json({
          code: 'success',
          message: 'Khôi phục tour thành công!'
        })
        break;
      case "delete-destroy":
        await Tour.deleteMany({
          _id: {
            $in: listId
          }
        });
        res.json({
          code: 'success',
          message: 'Xoá tour thành công!'
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

module.exports.restorePatch = async (req, res) => {
  try {
    const id = req.params.id;
    const tourDetail = await Tour.findById(id);
    if (!tourDetail) {
      res.json({
        code: "error",
        message: "Tour không tồn tại!",
      })
      return;
    }

    await Tour.updateOne({
      _id: id
    }, {
      deleted: false,
    })
    res.json({
      code: "success",
      message: "Đã khôi phục tour!",
    })
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
