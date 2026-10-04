const Category = require('../../models/category.model');
const buildBreadcrumb = require('../../helpers/breadcrumb.helper');
module.exports.list = async (req, res) => {
  try {
    const { slug } = req.params;
    const categoryList = await Category.find({
      deleted: false,
      status: "active",
    }).lean();
    const categoryDetail = await Category.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    }).lean();
    const breadcrumb = buildBreadcrumb(categoryDetail, categoryList);
    
    res.render('client/pages/tour-list', {
      pageTitle: 'Danh sách tour',
      breadcrumb: breadcrumb,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}