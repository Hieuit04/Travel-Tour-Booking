const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');
const Category = require('../../models/category.model');
const buildBreadcrumb = require('../../helpers/breadcrumb.helper');
const moment = require('moment'); 
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
    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format('DD/MM/YYYY');
    const currentCategory = categoryList.find(cat => cat._id.toString() === tourDetail.category);
    const breadcrumb = buildBreadcrumb(currentCategory, categoryList);
    const cityList = await City.find({
      _id: { $in: tourDetail.location}
    }).lean();
    breadcrumb.push({
      categoryName: tourDetail.tourName,
      avatar: tourDetail.avatar,
      slug: tourDetail.slug
    });
    res.render('client/pages/tour-detail', {
      pageTitle: tourDetail.tourName,
      tourDetail: tourDetail,
      cityList: cityList,
      breadcrumb: breadcrumb  
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}