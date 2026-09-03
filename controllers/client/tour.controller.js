const Tour = require('../../models/tour.model');

module.exports.list = async (req, res) => {
  const tourList = await Tour.find({});
  console.log(tourList);
  res.render('client/pages/tour', {
    pageTitle: 'Danh sách tour',
    tourList: tourList
  });
}