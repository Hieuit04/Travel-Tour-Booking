const Category = require('../../models/category.model');

module.exports.list = (req, res) => {
  res.render('admin/pages/category-list', {
    pageTitle: 'Danh sách danh mục',
  });
}

module.exports.create = (req, res) => {
  res.render('admin/pages/category-create', {
    pageTitle: 'Tạo mới danh mục',
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
    req.body.createdBy = res.locals.account.id;
    console.log(req.body)
    const newRecord = new Category(req.body);
    await newRecord.save();
    console.log(req.body)
    res.json({
      code: "success",
      message: "Danh mục đã được tạo thành công",
    }) 
  } catch(error) {
    res, json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
