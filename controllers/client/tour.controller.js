const Tour = require('../../models/tour.model');
const Category = require('../../models/category.model');
const buildBreadcrumb = require('../../helpers/breadcrumb.helper');
module.exports.list = async (req, res) => {
  const tourList = await Tour.find({});
  res.render('client/pages/tour-list', {
    pageTitle: 'Danh sách tour',
    tourList: tourList
  });
}

module.exports.detail = async (req, res) => {
  try {
    const { slug } = req.params;
    const categoryList = await Category.find({
      deleted: false,
      status: "active",
    }).lean();
    const tourDetail = await Tour.findOne({
      slug: slug,
      status: "active",
      deleted: false,
    });
    if(!tourDetail) {
      res.redirect('/');
      return;
    }
    const currentCategory = categoryList.find(cat => cat._id.toString() === tourDetail.category);
    const breadcrumb = buildBreadcrumb(currentCategory, categoryList);
    // Push thông tin tour vào cuối mảng breadcrumb
    breadcrumb.push({
      categoryName: tourDetail.tourName,
      avatar: tourDetail.avatar,
      slug: tourDetail.slug
    });
    res.render('client/pages/tour-detail', {
      pageTitle: tourDetail.tourName,
      tourDetail: tourDetail,
      breadcrumb: breadcrumb  
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}