const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');
const { formatTourItem } = require('../../helpers/tour.helper');
const slugify = require('slugify');

module.exports.list = async (req, res) => {
  const find = {
    status: "active",
    deleted: false,
  }
  // Điểm đi
  if (req.query.locationFrom) {
    find.location = { $in: [req.query.locationFrom] };
  }
  // end Điểm đi

  // Điểm đến
  if (req.query.locationTo) {
    const keywordRegex = new RegExp(req.query.locationTo, 'i');
    find.tourName = keywordRegex;
  }
  // end Điểm đến

  // Ngày khởi hành (Trong phạm vi ngày được chọn)
  if (req.query.departureDate) {
    const startDate = new Date(req.query.departureDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    find.departureDate = { $gte: startDate, $lt: endDate };
  }

  // Số lượng hành khách (Số chỗ còn trống phải >= số lượng cần đặt)
  if (req.query.stockAdult && parseInt(req.query.stockAdult) > 0) {
    find.stockAdult = { $gte: parseInt(req.query.stockAdult) };
  }
  if (req.query.stockChildren && parseInt(req.query.stockChildren) > 0) {
    find.stockChildren = { $gte: parseInt(req.query.stockChildren) };
  }
  if (req.query.stockBaby && parseInt(req.query.stockBaby) > 0) {
    find.stockBaby = { $gte: parseInt(req.query.stockBaby) };
  }

  // Mức giá (So sánh dựa vào giá người lớn đã giảm)
  if (req.query.price) {
    const [min, max] = req.query.price.split('-');
    if (min && max) {
      find.newPriceAdult = { $gte: parseInt(min), $lte: parseInt(max) };
    }
  }

  const tourList = await Tour.find(find)
    .sort({
      position: "desc"
    });
  for (const item of tourList) {
    formatTourItem(item)
  }
  // Danh sách tỉnh thành
  const cityList = await City.find({})
  // end Danh sách tỉnh thành
  res.render('client/pages/search', {
    pageTitle: 'Kết quả tìm kiếm',
    tourList: tourList,
    cityList: cityList
  });
}