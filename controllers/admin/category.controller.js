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
