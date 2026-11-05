const Tour = require('../../models/tour.model.js');
const City = require('../../models/city.model.js');
const Cart = require('../../models/cart.model.js');
const moment = require('moment');
const mongoose = require('mongoose');

const unauthorized = (res) => {
  return res.status(401).json({
    code: "unauthorized",
    message: "Vui lòng đăng nhập để thực hiện chức năng này!"
  });
}

// Chuyển item trong DB thành object thuần để gửi cho client
const toPlainItem = (item) => ({
  tourId: String(item.tourId),
  locationForm: item.locationForm ? String(item.locationForm) : "",
  quantityAdult: item.quantityAdult || 0,
  quantityChildren: item.quantityChildren || 0,
  quantityBaby: item.quantityBaby || 0,
  checked: item.checked,
});

// Làm sạch dữ liệu từ client, chỉ giữ các trường hợp lệ
const sanitizeItem = (raw) => {
  if (!raw || !mongoose.isValidObjectId(raw.tourId)) return null;
  const fields = {};
  for (const key of ["quantityAdult", "quantityChildren", "quantityBaby"]) {
    if (raw[key] !== undefined) {
      const value = parseInt(raw[key]);
      fields[key] = Number.isNaN(value) || value < 0 ? 0 : value;
    }
  }
  if (raw.checked !== undefined) fields.checked = !!raw.checked;
  if (raw.locationForm && mongoose.isValidObjectId(raw.locationForm)) {
    fields.locationForm = raw.locationForm;
  }
  return { tourId: String(raw.tourId), fields };
}

// Lấy thông tin chi tiết tour cho danh sách item
const buildCartDetail = async (items) => {
  const cartDetail = [];
  for (const item of items) {
    const tourDetail = await Tour.findOne({
      _id: item.tourId,
      status: "active",
      deleted: false,
    });
    if (tourDetail) {
      const city = item.locationForm
        ? await City.findOne({ _id: item.locationForm })
        : null;
      cartDetail.push({
        ...item,
        detail: {
          avatar: tourDetail.avatar,
          tourName: tourDetail.tourName,
          slug: tourDetail.slug,
          departureDate: moment(tourDetail.departureDate).format("DD/MM/YYYY"),
          cityName: city ? city.name : "",
          stockAdult: tourDetail.stockAdult,
          stockChildren: tourDetail.stockChildren,
          stockBaby: tourDetail.stockBaby,
          newPriceAdult: tourDetail.newPriceAdult,
          newPriceChildren: tourDetail.newPriceChildren,
          newPriceBaby: tourDetail.newPriceBaby,
        }
      });
    }
  }
  return cartDetail;
}

module.exports.cart = async (req, res) => {
  res.render('client/pages/cart', {
    pageTitle: 'Giỏ hàng',
  });
}

module.exports.detailPost = async (req, res) => {
  try {
    const loggedIn = !!res.locals.account;
    let items = [];
    if (loggedIn) {
      // Đã đăng nhập: lấy giỏ hàng từ DB
      const cart = await Cart.findOne({ accountId: res.locals.account.id });
      items = cart ? cart.items.map(toPlainItem) : [];
    } else {
      // Chưa đăng nhập: lấy giỏ hàng client gửi lên (localStorage)
      items = Array.isArray(req.body) ? req.body : [];
    }
    const cartDetail = await buildCartDetail(items);
    res.json({
      code: "success",
      message: items.length === 0 ? "Giỏ hàng rỗng" : "Thành công",
      loggedIn: loggedIn,
      cartDetail: cartDetail,
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ"
    })
  }
}

module.exports.countGet = async (req, res) => {
  try {
    if (!res.locals.account) return unauthorized(res);
    const cart = await Cart.findOne({ accountId: res.locals.account.id });
    res.json({
      code: "success",
      count: cart ? cart.items.length : 0,
    });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
  }
}

// Thêm mới hoặc cập nhật (một phần) item trong giỏ hàng
module.exports.addPost = async (req, res) => {
  try {
    if (!res.locals.account) return unauthorized(res);
    const data = sanitizeItem(req.body);
    if (!data) {
      return res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
    }
    const accountId = res.locals.account.id;
    let cart = await Cart.findOne({ accountId: accountId });
    if (!cart) cart = new Cart({ accountId: accountId, items: [] });

    const existItem = cart.items.find(item => String(item.tourId) === data.tourId);
    if (existItem) {
      Object.assign(existItem, data.fields);
    } else {
      const total = (data.fields.quantityAdult || 0)
        + (data.fields.quantityChildren || 0)
        + (data.fields.quantityBaby || 0);
      if (total === 0) {
        return res.json({ code: "error", message: "Vui lòng chọn số lượng" });
      }
      cart.items.unshift({ tourId: data.tourId, ...data.fields });
    }
    await cart.save();
    res.json({
      code: "success",
      existed: !!existItem,
      count: cart.items.length,
    });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
  }
}

module.exports.itemDelete = async (req, res) => {
  try {
    if (!res.locals.account) return unauthorized(res);
    const { tourId } = req.params;
    if (!mongoose.isValidObjectId(tourId)) {
      return res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
    }
    await Cart.updateOne(
      { accountId: res.locals.account.id },
      { $pull: { items: { tourId: tourId } } }
    );
    res.json({ code: "success", message: "Đã xoá!" });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
  }
}

// Gộp giỏ hàng localStorage vào giỏ hàng trong DB sau khi đăng nhập
module.exports.mergePost = async (req, res) => {
  try {
    if (!res.locals.account) return unauthorized(res);
    const localItems = Array.isArray(req.body) ? req.body : [];
    const accountId = res.locals.account.id;
    let cart = await Cart.findOne({ accountId: accountId });
    if (!cart) cart = new Cart({ accountId: accountId, items: [] });

    for (const raw of localItems) {
      const data = sanitizeItem(raw);
      if (!data) continue;
      const tour = await Tour.findOne({
        _id: data.tourId,
        status: "active",
        deleted: false,
      });
      if (!tour) continue;
      // Kẹp số lượng theo tồn kho
      if (data.fields.quantityAdult !== undefined)
        data.fields.quantityAdult = Math.min(data.fields.quantityAdult, tour.stockAdult);
      if (data.fields.quantityChildren !== undefined)
        data.fields.quantityChildren = Math.min(data.fields.quantityChildren, tour.stockChildren);
      if (data.fields.quantityBaby !== undefined)
        data.fields.quantityBaby = Math.min(data.fields.quantityBaby, tour.stockBaby);

      const existItem = cart.items.find(item => String(item.tourId) === data.tourId);
      if (existItem) {
        Object.assign(existItem, data.fields);
      } else {
        cart.items.unshift({ tourId: data.tourId, ...data.fields });
      }
    }
    await cart.save();
    res.json({
      code: "success",
      message: "Đã gộp giỏ hàng",
      count: cart.items.length,
    });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
  }
}
