const Order = require('../models/order.model');
const Tour = require('../models/tour.model');
const Promotion = require('../models/promotion.model');

const seats = (item) => [
  ["stockAdult", item.quantityAdult],
  ["stockChildren", item.quantityChildren],
  ["stockBaby", item.quantityBaby],
].filter(([, quantity]) => quantity > 0);

const releaseStock = (items) => Promise.all(items.map(item => Tour.updateOne(
  { _id: item.tourId },
  { $inc: Object.fromEntries(seats(item)) }
)));

// Trừ chỗ có điều kiện để hai đơn đồng thời không vượt tồn kho; trả về item không đủ chỗ
const reserveStock = async (items) => {
  const done = [];
  for (const item of items) {
    const list = seats(item);
    const result = await Tour.updateOne({
      _id: item.tourId,
      status: "active",
      deleted: false,
      ...Object.fromEntries(list.map(([field, quantity]) => [field, { $gte: quantity }])),
    }, {
      $inc: Object.fromEntries(list.map(([field, quantity]) => [field, -quantity])),
    });
    if (!result.modifiedCount) {
      await releaseStock(done);
      return item;
    }
    done.push(item);
  }
  return null;
};

// stockReserved: đơn cũ chưa từng trừ chỗ thì không trả lại; cờ cũng chặn trả chỗ hai lần
const releaseOrderStock = async (order) => {
  const result = await Order.updateOne({ _id: order._id, stockReserved: true }, { stockReserved: false });
  if (result.modifiedCount) await releaseStock(order.items);
};

// Trả về false nếu đơn cần mở lại nhưng tour không còn đủ chỗ
const syncOrderStock = async (order, status) => {
  if (!status || status === order.status) return true;
  if (status === "cancel") {
    await releaseOrderStock(order);
    return true;
  }
  if (order.status !== "cancel") return true;
  if (await reserveStock(order.items)) return false;
  await Order.updateOne({ _id: order._id }, { stockReserved: true });
  return true;
};

// Đơn đã hoàn thành thì tour đã đi, không cần trả chỗ
const releaseDeletedOrders = async (ids) => {
  const orders = await Order.find({ _id: { $in: ids }, status: { $ne: "done" } });
  for (const order of orders) await releaseOrderStock(order);
};

const isCount = (value) => Number.isInteger(value) && value >= 0;
const validQuantities = (item) => Number.isInteger(item.quantityAdult) && item.quantityAdult >= 1
  && isCount(item.quantityChildren) && isCount(item.quantityBaby);

const itemAmount = (item, tour) => (tour.newPriceAdult * item.quantityAdult)
  + (tour.newPriceChildren * item.quantityChildren)
  + (tour.newPriceBaby * item.quantityBaby);

// Giảm tối đa discountUpTo, chỉ tính trên các tour thuộc chiến dịch (chiến dịch không chọn tour: cả đơn)
const couponDiscount = (promotion, lines) => {
  const ids = promotion.products.map(product => String(product.tourId));
  const eligible = lines
    .filter(line => !ids.length || ids.includes(String(line.tourId)))
    .reduce((sum, line) => sum + line.amount, 0);
  return Math.min(promotion.discountUpTo || 0, eligible);
};

// shortcut: mã không giới hạn lượt dùng và không kiểm tra trùng giữa các chiến dịch, thêm khi cần
const findCouponDiscount = async (coupon, lines) => {
  const code = String(coupon || "").trim().toUpperCase();
  if (!code) return 0;
  const now = new Date();
  const promotion = await Promotion.findOne({
    couponCode: code,
    status: "active",
    deleted: false,
    timeStart: { $lte: now },
    timeEnd: { $gte: now },
  });
  return promotion ? couponDiscount(promotion, lines) : 0;
};

module.exports = {
  reserveStock,
  releaseStock,
  releaseOrderStock,
  syncOrderStock,
  releaseDeletedOrders,
  validQuantities,
  itemAmount,
  couponDiscount,
  findCouponDiscount,
};
