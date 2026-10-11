const AccountAdmin = require('../../models/accounts-admin.model');
const Order = require('../../models/order.model');
const moment = require('moment');
const variableConfig = require('../../configs/variable.config');

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
  });

  overView.totalRevenue = orderList.reduce((total, order) => {
    return total + order.total;
  }, 0);

  // Lấy 5 đơn hàng mới nhất
  const newOrders = await Order
    .find({ deleted: false })
    .sort({ createdAt: "desc" })
    .limit(5);

  res.render('admin/pages/dashboard', {
    pageTitle: 'Trang tổng quan',
    overView: overView,
    newOrders: newOrders,
    moment: moment,
    orderStatusList: variableConfig.orderStatusList,
    paymentStatusList: variableConfig.paymentStatusList,
    paymentMethodList: variableConfig.paymentMethodList,
  });
}


module.exports.revenueChartPost = async (req, res) => {
  try {
    const {
      currentMonth,
      currentYear,
      previousMonth,
      previousYear,
      arrayDay
    } = req.body;

    // Truy vấn tất cả đơn hàng trong tháng hiện tại 
    const currentMonthOrders = await Order.find({
      deleted: false,
      paymentStatus: 'paid',
      status: "done",
      createdAt: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1),
      }
    });
    // Truy vấn tất cả đơn hàng trong tháng trước đó 
    const previousMonthOrders = await Order.find({
      deleted: false,
      paymentStatus: 'paid',
      status: "done",
      createdAt: {
        $gte: new Date(previousYear, previousMonth - 1, 1),
        $lt: new Date(previousYear, previousMonth, 1),
      }
    });

    // Tạo mảng doanh thu từng ngày của từng tháng
    const dataCurrentMonth = [];
    const dataPreviousMonth = [];

    // Tính tổng doanh thu từng ngày của tháng hiện tại
    for (let i = 0; i < arrayDay.length; i++) {
      const day = arrayDay[i];
      const totalPriceDay = currentMonthOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === day;
      }).reduce((total, order) => {
        return total + order.total;
      }, 0);
      dataCurrentMonth.push(totalPriceDay);
    };

    // Tính tổng doanh thu từng ngày của tháng trước đó
    for (let i = 0; i < arrayDay.length; i++) {
      const day = arrayDay[i];
      const totalPriceDay = previousMonthOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getDate() === day;
      }).reduce((total, order) => {
        return total + order.total;
      }, 0);
      dataPreviousMonth.push(totalPriceDay);
    };

    return res.json({
      code: "success",
      message: "Lấy biểu đồ doanh thu thành công!",
      dataCurrentMonth: dataCurrentMonth,
      dataPreviousMonth: dataPreviousMonth,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      code: "error",
      message: "Không lấy được biểu đồ doanh thu!"
    });
  }
}
