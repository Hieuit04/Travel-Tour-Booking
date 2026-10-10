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

    // Phan trang
    const pagination = {
      currentPage: 1,
      limitItems: 9
    };
    if (req.query.page) {
      pagination.currentPage = parseInt(req.query.page);
    }
    pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;

    const countTours = await Tour.countDocuments({
      deleted: false,
      status: "active",
      category: {
        $in: categoryFilter(categoryList, categoryDetail._id)
      }
    });
    pagination.totalItems = countTours;
    pagination.totalPage = Math.ceil(countTours / pagination.limitItems);

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
      .skip(pagination.skip)
      .limit(pagination.limitItems);
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
      pagination: pagination,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}