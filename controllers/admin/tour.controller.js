const Category = require('../../models/category.model');
const City = require('../../models/city.model');
const Tour = require('../../models/tour.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const moment = require('moment');
const buildCategoryTree = require('../../helpers/categoryTree.helper');
module.exports.list = async (req, res) => {
  const tourList = await Tour.find({
    deleted: false,
  }).sort({
    position: "desc"
  });

  for (const item of tourList) {
    if (item.createdBy) {
      const createdBy = await AccountAdmin.findById(item.createdBy);
      item.createdByName = createdBy.fullName;
      item.createdAtFormat= moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    }
    if (item.updatedBy) {
      const updatedBy = await AccountAdmin.findById(item.updatedBy);
      item.updatedByName = updatedBy.fullName;
      item.updatedAtFormat= moment(item.updatedAt).format('HH:mm - DD/MM/YYYY');
    }
  }

  res.render('admin/pages/tour-list', {
    pageTitle: 'Danh sách tour',
    tourList: tourList,
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

module.exports.trash = (req, res) => {
  res.render('admin/pages/tour-trash', {
    pageTitle: 'Thùng rác tour',
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
  } catch (error){
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
  } catch (error){
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
        message: "Danh mục không tồn tại!",
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