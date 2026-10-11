const AccountAdmin = require('../../models/accounts-admin.model');
const Order = require('../../models/order.model');

module.exports.dashboard = async (req, res) => {
  const overView = {
    totalAdmin: 0,
    totalOrder: 0,
    totalRevenue: 0,
  }

  overView.totalAdmin = await AccountAdmin.countDocuments({ deleted: false });
  overView.totalOrder = await Order.countDocuments({ deleted: false });
  const orderList = await Order.find({
    deleted: false,
    paymentStatus: 'paid',
    status: "done",
  })

  overView.totalRevenue = orderList.reduce((total, order) => {
    return total + order.total;
  }, 0);

  res.render('admin/pages/dashboard', {
    pageTitle: 'Trang tổng quan',
    overView: overView,
  });
}
