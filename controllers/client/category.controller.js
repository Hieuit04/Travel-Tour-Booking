const Category = require('../../models/category.model');
const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');
const buildBreadcrumb = require('../../helpers/breadcrumb.helper');
const categoryFilter = require('../../helpers/categoryFilter.helper');
const { formatTourItem } = require('../../helpers/tour.helper');

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

    // Danh sách tour theo danh mục
    const tourList = await Tour
      .find({
        deleted: false,
        status: "active",
        category: {
          $in: categoryFilter(categoryList, categoryDetail._id)
        }
      })
      .sort({
        position: "desc"
      })
      .limit(8);
    for (const item of tourList) {
      formatTourItem(item)
    }
    // end Danh sách tour theo danh mục
    // Danh sách tỉnh thành
    const cityList = await City.find({})
    // end Danh sách tỉnh thành
    res.render('client/pages/tour-list', {
      pageTitle: 'Danh sách tour',
      breadcrumb: breadcrumb,
      categoryDetail: categoryDetail,
      tourList: tourList,
      cityList: cityList,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}