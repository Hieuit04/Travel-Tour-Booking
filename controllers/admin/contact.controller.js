const Contact = require('../../models/contact.model');
const moment = require('moment');
const slugify = require('slugify')
const {checkPermission} = require('../../helpers/permission.helper')

module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
  }
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
  const limit = 5;
  let page = 1; 
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limit
  const totalRecord = await Contact.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
  }
  // End Phân trang 
  const recordList = await Contact.find(find)
    .skip(skip)
    .limit(limit)
    .sort({
    createdAt: "desc"
  });
  for (const record of recordList) {
    record.formattedCreatedAt = moment(record.createdAt).format('HH:mm - DD/MM/YYYY');
  }
  res.render('admin/pages/contact-list', {
    pageTitle: 'Thông tin liên hệ',
    recordList: recordList,
    pagination: pagination,

  });
};


module.exports.deletePatch = async (req, res) => {
  try {
    const id = req.params.id;
    const contactDetail = await Contact.findById(id);
    if (!contactDetail) {
      res.json({
        code: "error",
        message: "Liên hệ không tồn tại!",
      })
      return;
    }

    await Contact.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedBy: res.locals.account.id,
      deletedAt: new Date()
    })
    res.json({
      code: "success",
      message: "Đã xoá liên hệ!",
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
      case "delete":
        if(!checkPermission(res,"contact-delete")) return;
        await Contact.updateMany({
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
          message: 'Xoá liên hệ thành công!'
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

