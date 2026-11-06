const { isValidObjectId } = require('../../helpers/validate.helper');
const Tour = require('../../models/tour.model.js');
const City = require('../../models/city.model.js');
const Cart = require('../../models/cart.model.js');
const { itemAmount, findCouponDiscount } = require('../../helpers/order.helper');
const moment = require('moment');

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
      items = cart ? cart.items.map(item => ({
        tourId: String(item.tourId),
        locationForm: item.locationForm ? String(item.locationForm) : "",
        quantityAdult: item.quantityAdult || 0,
        quantityChildren: item.quantityChildren || 0,
        quantityBaby: item.quantityBaby || 0,
        checked: item.checked,
      })) : [];
    } else {
      // Chưa đăng nhập: lấy giỏ hàng client gửi lên (localStorage)
      items = Array.isArray(req.body) ? req.body : [];
    }

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
            departureDate: moment(tourDetail.departureDate).format('DD/MM/YYYY'),
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

// [POST] /cart/coupon: xem trước số tiền giảm, /order/create tính lại khi đặt
module.exports.couponPost = async (req, res) => {
  try {
    const { coupon, items } = req.body;
    const lines = [];
    for (const item of items) {
      const tourDetail = await Tour.findOne({ _id: String(item.tourId), status: "active", deleted: false });
      if (tourDetail) lines.push({ tourId: tourDetail.id, amount: itemAmount(item, tourDetail) });
    }
    const discount = await findCouponDiscount(coupon, lines);
    if (!discount) {
      return res.json({ code: "error", message: "Mã giảm giá không hợp lệ hoặc không áp dụng cho tour đã chọn!" });
    }
    res.json({ code: "success", discount: discount });
  } catch (error) {
    console.log(error);
    res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
  }
}


module.exports.countGet = async (req, res) => {
  try {
    if (!res.locals.account) {
      return res.status(401).json({
        code: "unauthorized",
        message: "Vui lòng đăng nhập để thực hiện chức năng này!"
      });
    }
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
    if (!res.locals.account) {
      return res.status(401).json({
        code: "unauthorized",
        message: "Vui lòng đăng nhập để thực hiện chức năng này!"
      });
    }
    const raw = req.body;
    if (!raw || !isValidObjectId(raw.tourId)) {
      return res.json({ code: "error", message: "Dữ liệu không hợp lệ" });
    }
    // Chỉ giữ các trường hợp lệ
    const fields = {};
    for (const key of ["quantityAdult", "quantityChildren", "quantityBaby"]) {
      if (raw[key] !== undefined) {
        const value = parseInt(raw[key]);
        fields[key] = Number.isNaN(value) || value < 0 ? 0 : value;
      }
    }
    if (raw.checked !== undefined) fields.checked = !!raw.checked;
    if (raw.locationForm && isValidObjectId(raw.locationForm)) {
      fields.locationForm = raw.locationForm;
    }

    const accountId = res.locals.account.id;
    let cart = await Cart.findOne({ accountId: accountId });
    if (!cart) cart = new Cart({ accountId: accountId, items: [] });

    const existItem = cart.items.find(item => String(item.tourId) === raw.tourId);
    if (existItem) {
      Object.assign(existItem, fields);
    } else {
      const total = (fields.quantityAdult || 0)
        + (fields.quantityChildren || 0)
        + (fields.quantityBaby || 0);
      if (total === 0) {
        return res.json({ code: "error", message: "Vui lòng chọn số lượng" });
      }
      cart.items.unshift({ tourId: raw.tourId, ...fields });
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
    if (!res.locals.account) {
      return res.status(401).json({
        code: "unauthorized",
        message: "Vui lòng đăng nhập để thực hiện chức năng này!"
      });
    }
    const { tourId } = req.params;
    if (!isValidObjectId(tourId)) {
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
    if (!res.locals.account) {
      return res.status(401).json({
        code: "unauthorized",
        message: "Vui lòng đăng nhập để thực hiện chức năng này!"
      });
    }
    const localItems = Array.isArray(req.body) ? req.body : [];
    const accountId = res.locals.account.id;
    let cart = await Cart.findOne({ accountId: accountId });
    if (!cart) cart = new Cart({ accountId: accountId, items: [] });

    for (const raw of localItems) {
      if (!raw || !isValidObjectId(raw.tourId)) continue;
      const tour = await Tour.findOne({
        _id: raw.tourId,
        status: "active",
        deleted: false,
      });
      if (!tour) continue;

      // Chỉ giữ các trường hợp lệ, kẹp số lượng theo tồn kho
      const stock = {
        quantityAdult: tour.stockAdult,
        quantityChildren: tour.stockChildren,
        quantityBaby: tour.stockBaby,
      };
      const fields = {};
      for (const key of Object.keys(stock)) {
        if (raw[key] !== undefined) {
          const value = parseInt(raw[key]);
          fields[key] = Number.isNaN(value) || value < 0 ? 0 : Math.min(value, stock[key]);
        }
      }
      if (raw.checked !== undefined) fields.checked = !!raw.checked;
      if (raw.locationForm && isValidObjectId(raw.locationForm)) {
        fields.locationForm = raw.locationForm;
      }

      const existItem = cart.items.find(item => String(item.tourId) === raw.tourId);
      if (existItem) {
        Object.assign(existItem, fields);
      } else {
        cart.items.unshift({ tourId: raw.tourId, ...fields });
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
