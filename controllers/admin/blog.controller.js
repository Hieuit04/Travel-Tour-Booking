const Blog = require('../../models/blog.model');
const Tour = require('../../models/tour.model');
const moment = require('moment');
const variableConfig = require('../../configs/variable.config');
const {checkPermission} = require('../../helpers/permission.helper');

// [GET] /admin/blog/list
module.exports.list = async (req, res) => {
  const find = {
    deleted: false,
    status: req.query.status || "pending" // Mặc định hiển thị bài chờ duyệt
  };
  if (req.query.status == "all") {
    delete find.status;
  }

  // Tìm kiếm theo tiêu đề
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    find.title = new RegExp(keyword, "i");
  }
  // End Tìm kiếm

  // Phân trang
  const limit = 5;
  let page = 1;
  if (req.query.page && parseInt(req.query.page) > 0) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limit;
  const totalRecord = await Blog.countDocuments(find);
  const totalPages = Math.ceil(totalRecord / limit);
  const pagination = {
    totalPages: totalPages,
    totalRecord: totalRecord,
    skip: skip,
  };
  // End Phân trang

  const blogList = await Blog.find(find)
    .skip(skip)
    .limit(limit)
    .sort({
      createdAt: "desc"
    });

  const tourIds = blogList.map(item => item.tourId).filter(Boolean);
  const tourList = await Tour.find({ _id: { $in: tourIds } }).select('tourName');
  for (const item of blogList) {
    const tour = tourList.find(tour => tour.id == item.tourId);
    item.tourName = tour ? tour.tourName : "";
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
    item.publishedAtFormat = item.publishedAt ? moment(item.publishedAt).format('HH:mm - DD/MM/YYYY') : "";
  }

  res.render('admin/pages/blog-list', {
    pageTitle: 'Quản lý bài viết',
    blogList: blogList,
    pagination: pagination,
    blogStatusList: variableConfig.blogStatusList
  });
};

// [GET] /admin/blog/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const blogDetail = await Blog.findOne({
      _id: req.params.id,
      deleted: false
    });
    if (!blogDetail) {
      res.redirect(`/${variableConfig.pathAdmin}/blog/list`);
      return;
    }
    const tour = await Tour.findOne({ _id: blogDetail.tourId }).select('tourName slug');
    blogDetail.createdAtFormat = moment(blogDetail.createdAt).format('HH:mm - DD/MM/YYYY');
    blogDetail.publishedAtFormat = blogDetail.publishedAt ? moment(blogDetail.publishedAt).format('HH:mm - DD/MM/YYYY') : "";
    res.render('admin/pages/blog-edit', {
      pageTitle: 'Chi tiết bài viết',
      blogDetail: blogDetail,
      tour: tour
    });
  } catch (error) {
    res.redirect(`/${variableConfig.pathAdmin}/blog/list`);
  }
};

// [PATCH] /admin/blog/edit/:id
// action = "draft": lưu nháp, bài về trạng thái chờ duyệt
// action = "publish": duyệt và đăng lên trang Tin tức
module.exports.editPatch = async (req, res) => {
  try {
    const { title, excerpt, content, avatar, action } = req.body;
    if (!["draft", "publish"].includes(action)) {
      res.json({
        code: "error",
        message: "Hành động không hợp lệ!"
      });
      return;
    }
    if (action == "publish" && !checkPermission(res, "blog-publish")) return;

    const plainContent = (content || "").replace(/<[^>]*>|&nbsp;/g, "").trim();
    if (!title || !title.trim() || !plainContent) {
      res.json({
        code: "error",
        message: "Tiêu đề và nội dung không được để trống!"
      });
      return;
    }

    const blogDetail = await Blog.findOne({
      _id: req.params.id,
      deleted: false
    });
    if (!blogDetail) {
      res.json({
        code: "error",
        message: "Bài viết không tồn tại!"
      });
      return;
    }

    const dataUpdate = {
      title: title.trim(),
      excerpt: excerpt || "",
      content: content,
      avatar: avatar || "",
      updatedBy: res.locals.account.id
    };
    if (action == "publish") {
      dataUpdate.status = "active";
      dataUpdate.publishedAt = new Date();
      dataUpdate.publishedBy = res.locals.account.id;
    } else {
      dataUpdate.status = "pending";
    }

    await Blog.updateOne({ _id: blogDetail.id }, dataUpdate);

    res.json({
      code: "success",
      message: action == "publish" ? "Đăng bài thành công!" : "Đã lưu nháp bài viết!"
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
};

// [PATCH] /admin/blog/delete/:id
module.exports.deletePatch = async (req, res) => {
  try {
    await Blog.updateOne({
      _id: req.params.id
    }, {
      deleted: true,
      deletedBy: res.locals.account.id,
      deletedAt: Date.now()
    });
    res.json({
      code: "success",
      message: "Xóa bài viết thành công!"
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
};

// [PATCH] /admin/blog/change-multi
module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, listId } = req.body;
    const adminId = res.locals.account.id;
    switch (option) {
      case "publish":
        if (!checkPermission(res, "blog-publish")) return;
        await Blog.updateMany({
          _id: { $in: listId },
          deleted: false,
          status: "pending"
        }, {
          status: "active",
          publishedAt: new Date(),
          publishedBy: adminId,
          updatedBy: adminId
        });
        res.json({
          code: "success",
          message: "Đăng bài thành công!"
        });
        break;
      case "pending":
        if (!checkPermission(res, "blog-publish")) return;
        await Blog.updateMany({
          _id: { $in: listId },
          deleted: false
        }, {
          status: "pending",
          updatedBy: adminId
        });
        res.json({
          code: "success",
          message: "Đã gỡ bài, chuyển về chờ duyệt!"
        });
        break;
      case "delete":
        if (!checkPermission(res, "blog-delete")) return;
        await Blog.updateMany({
          _id: { $in: listId }
        }, {
          deleted: true,
          deletedBy: adminId,
          deletedAt: Date.now()
        });
        res.json({
          code: "success",
          message: "Xóa bài viết thành công!"
        });
        break;
      default:
        res.json({
          code: "error",
          message: "Hành động không hợp lệ!"
        });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
};
