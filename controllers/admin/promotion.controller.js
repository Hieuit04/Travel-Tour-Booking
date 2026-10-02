const Promotion = require('../../models/promotion.model');
const Tour = require('../../models/tour.model');
const Category = require('../../models/category.model');
const AccountAdmin = require('../../models/accounts-admin.model');
const moment = require('moment');
const buildCategoryTree = require('../../helpers/categoryTree.helper');
const categoryFilter = require('../../helpers/categoryFilter.helper');
const slugify = require('slugify');
const { checkPermission } = require('../../helpers/permission.helper');

// [GET] /admin/promotion/list
module.exports.list = async (req, res) => {
  try {
    const find = { deleted: false };

    // Lọc theo trạng thái
    if (req.query.status) {
      find.status = req.query.status;
    }

    // Lọc theo từ khóa (tìm kiếm)
    if (req.query.keyword) {
      const keyword = req.query.keyword;
      const regex = new RegExp(keyword, 'i');
      find.promotionName = regex;
    }

    // Lọc theo khoảng thời gian (timeStart)
    if (req.query.startDate) {
      find.timeStart = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      find.timeEnd = {
        ...find.timeEnd,
        $lte: new Date(endDate.setUTCHours(23, 59, 59, 999)),
      };
    }

    // Phân trang
    const limit = 5; // Hoặc số lượng bản ghi mỗi trang bạn muốn
    let page = 1;
    if (req.query.page && parseInt(req.query.page) > 0) {
      page = parseInt(req.query.page);
    }
    const skip = (page - 1) * limit;
    
    const totalRecord = await Promotion.countDocuments(find);
    const totalPages = Math.ceil(totalRecord / limit);
    const pagination = {
      totalPages: totalPages,
      totalRecord: totalRecord,
      skip: skip,
      page: page
    };
    // End Phân trang

    const promotionList = await Promotion.find(find)
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit);
    // Gắn trạng thái thực tế (Sắp diễn ra / Đang diễn ra / Đã kết thúc)
    const now = new Date();
    for (const item of promotionList) {
      item.timeStartFormat = moment(item.timeStart).format('DD/MM/YYYY HH:mm');
      item.timeEndFormat = moment(item.timeEnd).format('DD/MM/YYYY HH:mm');
      if (now < item.timeStart) {
        item.timeStatus = 'upcoming'; // Sắp diễn ra
      } else if (now > item.timeEnd) {
        item.timeStatus = 'expired';  // Đã kết thúc
      } else {
        item.timeStatus = 'ongoing';  // Đang diễn ra
      }
    }

    res.render('admin/pages/promotion-list', {
      pageTitle: 'Quản lý khuyến mãi',
      promotionList: promotionList,
      pagination: pagination
    });
  } catch (error) {
    console.log('===> LỖI PROMOTION LIST:', error);
    res.redirect('back');
  }
};

// [GET] /admin/promotion/create
module.exports.create = async (req, res) => {
  try {
    const categoryList = await Category.find({ deleted: false });
    const categoryTree = buildCategoryTree(categoryList, '');
    const accountList = await AccountAdmin.find({});

    res.render('admin/pages/promotion-create', {
      pageTitle: 'Tạo khuyến mãi',
      categoryTree: categoryTree,
      accountList: accountList,
    });
  } catch (error) {
    console.log('===> LỖI PROMOTION CREATE:', error);
    res.redirect('back');
  }
};

// [GET] /admin/promotion/tours - API trả về JSON (dùng cho AJAX)
module.exports.getTours = async (req, res) => {
  try {
    const find = { deleted: false };
    if (req.query.status) find.status = req.query.status;
    if (req.query.createdBy) find.createdBy = req.query.createdBy;

    const categoryList = await Category.find({ deleted: false });
    if (req.query.category) {
      find.category = { $in: categoryFilter(categoryList, req.query.category) };
    }

    if (req.query.keyword) {
      const s = slugify(req.query.keyword, { lower: true });
      find.slug = new RegExp(s, 'i');
    }

    const limit = 5;
    let page = parseInt(req.query.page) || 1;
    if (page < 1) page = 1;
    const skip = (page - 1) * limit;
    const totalRecord = await Tour.countDocuments(find);
    const totalPages = Math.ceil(totalRecord / limit);

    const tourList = await Tour.find(find).skip(skip).limit(limit).sort({ position: 'desc' });

    // Gắn tên người tạo
    const result = [];
    for (const item of tourList) {
      let createdByName = '';
      if (item.createdBy) {
        const creator = await AccountAdmin.findById(item.createdBy);
        if (creator) createdByName = creator.fullName;
      }
      result.push({
        id: item._id,
        tourName: item.tourName,
        avatar: item.avatar,
        priceAdult: item.priceAdult || 0,
        priceChildren: item.priceChildren || 0,
        priceBaby: item.priceBaby || 0,
        stockAdult: item.stockAdult || 0,
        stockChildren: item.stockChildren || 0,
        stockBaby: item.stockBaby || 0,
        position: item.position || 0,
        status: item.status,
        createdByName: createdByName,
        createdAtFormat: moment(item.createdAt).format('HH:mm - DD/MM/YYYY'),
      });
    }

    res.json({
      code: 'success',
      tourList: result,
      pagination: { totalPages, totalRecord, skip, page },
    });
  } catch (error) {
    console.log('===> LỖI GET TOURS API:', error);
    res.json({ code: 'error', message: 'Lỗi tải danh sách tour' });
  }
};

// [POST] /admin/promotion/create

module.exports.createPost = async (req, res) => {
  try {
    if (!checkPermission(res, 'promotion-create')) return;

    // Xử lý mảng products từ form
    const products = [];
    if (req.body.tourId) {
      const tourIds = Array.isArray(req.body.tourId) ? req.body.tourId : [req.body.tourId];
      const specialPricesAdult = Array.isArray(req.body.specialPriceAdult) ? req.body.specialPriceAdult : [req.body.specialPriceAdult];
      const specialPricesChildren = Array.isArray(req.body.specialPriceChildren) ? req.body.specialPriceChildren : [req.body.specialPriceChildren];
      const specialPricesBaby = Array.isArray(req.body.specialPriceBaby) ? req.body.specialPriceBaby : [req.body.specialPriceBaby];
      const stockLimits = Array.isArray(req.body.stockLimit) ? req.body.stockLimit : [req.body.stockLimit];

      for (let i = 0; i < tourIds.length; i++) {
        if (tourIds[i]) {
          products.push({
            tourId: tourIds[i],
            specialPriceAdult: parseInt(specialPricesAdult[i]) || 0,
            specialPriceChildren: parseInt(specialPricesChildren[i]) || 0,
            specialPriceBaby: parseInt(specialPricesBaby[i]) || 0,
            stockLimit: parseInt(stockLimits[i]) || 0,
          });
        }
      }
    }

    const newPromotion = new Promotion({
      promotionName: req.body.promotionName,
      description: req.body.description,
      discountUpTo: parseInt(req.body.discountUpTo) || 0,
      timeStart: req.body.timeStart ? new Date(req.body.timeStart) : null,
      timeEnd: req.body.timeEnd ? new Date(req.body.timeEnd) : null,
      status: req.body.status || 'active',
      products: products,
      createdBy: res.locals.account.id,
    });

    await newPromotion.save();
    res.json({ code: 'success', message: 'Tạo khuyến mãi thành công!' });
  } catch (error) {
    console.log('===> LỖI PROMOTION CREATE POST:', error);
    res.json({ code: 'error', message: 'Dữ liệu không hợp lệ!' });
  }
};

// [GET] /admin/promotion/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const promotionDetail = await Promotion.findById(id);
    if (!promotionDetail) {
      return res.redirect(`/${global.pathAdmin}/promotion/list`);
    }

    const tourList = await Tour.find({ deleted: false, status: 'active' }).sort({ tourName: 1 });

    promotionDetail.timeStartFormat = promotionDetail.timeStart
      ? moment(promotionDetail.timeStart).format('YYYY-MM-DDTHH:mm')
      : '';
    promotionDetail.timeEndFormat = promotionDetail.timeEnd
      ? moment(promotionDetail.timeEnd).format('YYYY-MM-DDTHH:mm')
      : '';

    // Tạo map tourId → specialPrice để dễ render trong pug
    const productMap = {};
    for (const p of promotionDetail.products) {
      productMap[p.tourId.toString()] = p;
    }

    const categoryList = await Category.find({ deleted: false });
    const categoryTree = buildCategoryTree(categoryList, '');
    const accountList = await AccountAdmin.find({});

    res.render('admin/pages/promotion-edit', {
      pageTitle: 'Sửa khuyến mãi',
      promotionDetail: promotionDetail,
      tourList: tourList,
      productMap: productMap,
      categoryTree: categoryTree,
      accountList: accountList
    });
  } catch (error) {
    console.log('===> LỖI PROMOTION EDIT:', error);
    res.redirect(`/${global.pathAdmin}/promotion/list`);
  }
};

// [PATCH] /admin/promotion/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    if (!checkPermission(res, 'promotion-edit')) return;

    const id = req.params.id;

    // Xử lý mảng products từ form
    const products = [];
    if (req.body.tourId) {
      const tourIds = Array.isArray(req.body.tourId) ? req.body.tourId : [req.body.tourId];
      const specialPricesAdult = Array.isArray(req.body.specialPriceAdult) ? req.body.specialPriceAdult : [req.body.specialPriceAdult];
      const specialPricesChildren = Array.isArray(req.body.specialPriceChildren) ? req.body.specialPriceChildren : [req.body.specialPriceChildren];
      const specialPricesBaby = Array.isArray(req.body.specialPriceBaby) ? req.body.specialPriceBaby : [req.body.specialPriceBaby];
      const stockLimits = Array.isArray(req.body.stockLimit) ? req.body.stockLimit : [req.body.stockLimit];

      for (let i = 0; i < tourIds.length; i++) {
        if (tourIds[i]) {
          products.push({
            tourId: tourIds[i],
            specialPriceAdult: parseInt(specialPricesAdult[i]) || 0,
            specialPriceChildren: parseInt(specialPricesChildren[i]) || 0,
            specialPriceBaby: parseInt(specialPricesBaby[i]) || 0,
            stockLimit: parseInt(stockLimits[i]) || 0,
          });
        }
      }
    }

    await Promotion.findByIdAndUpdate(id, {
      promotionName: req.body.promotionName,
      description: req.body.description,
      discountUpTo: parseInt(req.body.discountUpTo) || 0,
      timeStart: req.body.timeStart ? new Date(req.body.timeStart) : null,
      timeEnd: req.body.timeEnd ? new Date(req.body.timeEnd) : null,
      status: req.body.status,
      products: products,
      updatedBy: res.locals.account.id,
    });

    res.json({ code: 'success', message: 'Cập nhật khuyến mãi thành công!' });
  } catch (error) {
    console.log('===> LỖI PROMOTION EDIT PATCH:', error);
    res.json({ code: 'error', message: 'Dữ liệu không hợp lệ!' });
  }
};

// [PATCH] /admin/promotion/delete/:id
module.exports.deletePatch = async (req, res) => {
  try {
    if (!checkPermission(res, 'promotion-delete')) return;
    const id = req.params.id;
    await Promotion.findByIdAndUpdate(id, {
      deleted: true,
      deletedBy: res.locals.account.id,
      deletedAt: new Date(),
    });
    res.json({ code: 'success', message: 'Xoá khuyến mãi thành công!' });
  } catch (error) {
    res.json({ code: 'error', message: 'Dữ liệu không hợp lệ!' });
  }
};

// [PATCH] /admin/promotion/change-multi
module.exports.changeMultiPatch = async (req, res) => {
  try {
    const adminId = res.locals.account.id;
    const { listId, option } = req.body;

    switch (option) {
      case 'active':
      case 'inactive':
        if (!checkPermission(res, 'promotion-edit')) return;
        await Promotion.updateMany({ _id: { $in: listId } }, { status: option, updatedBy: adminId });
        res.json({ code: 'success', message: 'Cập nhật khuyến mãi thành công!' });
        break;
      case 'delete':
        if (!checkPermission(res, 'promotion-delete')) return;
        await Promotion.updateMany({ _id: { $in: listId } }, {
          deleted: true,
          deletedBy: adminId,
          deletedAt: Date.now(),
        });
        res.json({ code: 'success', message: 'Xoá khuyến mãi thành công!' });
        break;
      default:
        res.json({ code: 'error', message: 'Hành động không hợp lệ!' });
    }
  } catch (error) {
    res.json({ code: 'error', message: 'Dữ liệu không hợp lệ!' });
  }
};