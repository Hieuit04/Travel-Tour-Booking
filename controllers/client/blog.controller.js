const Blog = require('../../models/blog.model');
const Tour = require('../../models/tour.model');
const moment = require('moment');

module.exports.list = async (req, res) => {
  const blogList = await Blog.find({
    status: "active",
    deleted: false
  }).sort({ createdAt: -1 }).lean();
  blogList.forEach(item => item.createdAtFormat = moment(item.createdAt).format('DD/MM/YYYY'));
  res.render('client/pages/blog-list', {
    pageTitle: 'Tin tức du lịch',
    blogList: blogList
  });
}

module.exports.detail = async (req, res) => {
  try {
    const blogDetail = await Blog.findOne({
      slug: req.params.slug,
      status: "active",
      deleted: false
    }).lean();
    if(!blogDetail) {
      res.redirect('/blog');
      return;
    }
    blogDetail.createdAtFormat = moment(blogDetail.createdAt).format('DD/MM/YYYY');
    const tour = blogDetail.tourId ? await Tour.findOne({
      _id: blogDetail.tourId,
      status: "active",
      deleted: false
    }).lean() : null;
    res.render('client/pages/blog-detail', {
      pageTitle: blogDetail.title,
      blogDetail: blogDetail,
      tour: tour
    });
  } catch (error) {
    console.error(error);
    res.redirect('/blog');
  }
}
