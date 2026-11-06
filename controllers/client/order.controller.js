const { randomNumberString } = require('../../helpers/generate.helper');
const Order = require('../../models/order.model');
const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');
const Cart = require('../../models/cart.model');

const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment');
const variableConfig = require('../../configs/variable.config');
const { callbackPromise } = require('nodemailer/lib/shared');
const { reserveStock, releaseStock, validQuantities, itemAmount, findCouponDiscount } = require('../../helpers/order.helper');

// Thanh toán lỗi: quay về trang đơn hàng, nơi có nút thanh toán lại
const orderUrl = ({ orderCode, phone }) => `/order/success?orderCode=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(phone)}`;

module.exports.createPost = async (req, res) => {
  let reservedItems = null;
  try {
    if (!res.locals.account) {
      return res.json({
        code: "error",
        message: "Vui lòng đăng nhập để đặt tour!",
        redirect: "/account/login",
      })
    }

    const { fullName, phone, note, paymentMethod, items, coupon } = req.body;
    const validMethod = variableConfig.paymentMethodList.some(method => method.value === paymentMethod);
    if (!fullName || !phone || !validMethod || !Array.isArray(items) || items.length === 0) {
      return res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ",
      })
    }

    // mã đơn hàng
    let code;
    while (true) {
      code = `OD${randomNumberString(8)}`
      const existOrder = await Order.findOne({ code: code });
      if (!existOrder) break;
    }

    let subTotal = 0;
    const orderItems = [];
    const lines = [];
    
    // Đã đăng nhập: lấy các tour được chọn từ giỏ hàng trong DB, không tin dữ liệu client
    if (res.locals.account) {
      const cart = await Cart.findOne({ accountId: res.locals.account.id });
      req.body.items = cart
        ? cart.items.filter(item => item.checked).map(item => ({
            tourId: String(item.tourId),
            locationForm: item.locationForm ? String(item.locationForm) : "",
            quantityAdult: item.quantityAdult || 0,
            quantityChildren: item.quantityChildren || 0,
            quantityBaby: item.quantityBaby || 0,
            checked: true,
          }))
        : [];
    }
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.json({
        code: "error",
        message: "Vui lòng chọn ít nhất 1 tour!",
      })
    }

    req.body.subTotal = 0;
    // Danh sách tour 
    for (const item of items) {
      if (!validQuantities(item)) {
        return res.json({
          code: "error",
          message: "Mỗi tour cần ít nhất 1 người lớn và số lượng hợp lệ!",
        })
      }
      const tourDetail = await Tour.findOne({ _id: String(item.tourId), status: "active", deleted: false });
      if (!tourDetail) {
        return res.json({
          code: "error",
          message: "Tour không tồn tại",
        })
      }
      const orderItem = {
        tourId: tourDetail.id,
        locationForm: item.locationForm,
        quantityAdult: item.quantityAdult,
        quantityChildren: item.quantityChildren,
        quantityBaby: item.quantityBaby,
        avatar: tourDetail.avatar,
        tourName: tourDetail.tourName,
        slug: tourDetail.slug,
        newPriceAdult: tourDetail.newPriceAdult,
        newPriceChildren: tourDetail.newPriceChildren,
        newPriceBaby: tourDetail.newPriceBaby,
        departureDate: tourDetail.departureDate,
      };

      if (item.locationForm) {
        const city = await City.findOne({ _id: String(item.locationForm) });
        if (city) orderItem.cityName = city.name;
      }

      const amount = itemAmount(item, tourDetail);
      subTotal += amount;
      lines.push({ tourId: tourDetail.id, amount: amount });
      orderItems.push(orderItem);
    }

    const discount = await findCouponDiscount(coupon, lines);
    if (coupon && !discount) {
      return res.json({
        code: "error",
        message: "Mã giảm giá không hợp lệ hoặc không áp dụng cho tour đã chọn!",
      })
    }

    const failedItem = await reserveStock(orderItems);
    if (failedItem) {
      return res.json({
        code: "error",
        message: `Tour "${failedItem.tourName}" không còn đủ chỗ!`,
      })
    }
    reservedItems = orderItems;

    const order = new Order({
      code: code,
      accountId: res.locals.account.id,
      fullName: fullName,
      phone: phone,
      note: note,
      items: orderItems,
      subTotal: subTotal,
      discount: discount,
      total: subTotal - discount,
      paymentMethod: paymentMethod,
      status: "initial",
      stockReserved: true,
    });
    await order.save();

    // Xoá các tour đã đặt khỏi giỏ hàng trong DB
    if (res.locals.account) {
      await Cart.updateOne(
        { accountId: res.locals.account.id },
        { $pull: { items: { checked: true } } }
      );
    }

    res.json({
      code: "success",
      message: "Đặt hàng thành công",
      orderCode: code,
    })
  } catch (error) {
    console.log(error);
    if (reservedItems) await releaseStock(reservedItems).catch(console.log);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ",
    })
  }
}

module.exports.success = async (req, res) => {
  try {
    const { orderCode, phone } = req.query;
    const order = await Order.findOne({ code: orderCode, phone: phone });

    if (!order) {
      res.redirect('/');
      return;
    }
    // Fallback cho các đơn hàng cũ chưa lưu cityName
    for (const item of order.items) {
      if (!item.cityName && item.locationForm) {
        const city = await City.findOne({ _id: item.locationForm });
        if (city) item.cityName = city.name;
      }
    }

    res.render('client/pages/order-success', {
      pageTitle: 'Đặt hàng thành công',
      order: order,
      moment: moment,
      paymentMethodList: variableConfig.paymentMethodList,
      orderStatusList: variableConfig.orderStatusList
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
}

module.exports.paymentZalopay = async (req, res) => {
  try {
    const { orderCode, phone } = req.query;
    const orderDetail = await Order.findOne({
      code: orderCode,
      phone: phone,
      status: "initial",
      deleted: false
    });

    if (!orderDetail) {
      res.redirect(orderUrl(req.query));
      return;
    }

    // APP INFO
    const config = {
      app_id: process.env.ZALOPAY_APPID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT
    };

    const embed_data = {
      redirecturl: `${process.env.DOMAIN_WEBSITE}/order/success?orderCode=${orderCode}&phone=${phone}`,
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: `${orderDetail.code}-${orderDetail.phone}`,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng ${orderDetail.code}`,
      bank_code: "",
      callback_url: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-result`
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order })
    const result = response.data;
    if (result.return_code == 1) {
      res.redirect(result.order_url);
    } else {
      res.redirect(orderUrl(req.query));
    }
  } catch (error) {
    console.log(error);
    res.redirect(orderUrl(req.query));
  }
}

module.exports.paymentZalopayResultPost = async (req, res) => {
  const config = {
    key2: process.env.ZALOPAY_KEY2
  };
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    }
    else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      const [orderCode, phone] = dataJson.app_user.split("-");
      const order = await Order.updateOne({
        code: orderCode,
        phone: phone,
        deleted: false,
        status: "initial", // không ghi đè đơn đã xác nhận/hủy
      }, {
        status: "paid",
        paidAt: new Date(),
      });

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
}


module.exports.paymentVnpay = async (req, res) => {
  try {
    const { orderCode, phone } = req.query;
    const orderDetail = await Order.findOne({
      code: orderCode,
      phone: phone,
      status: "initial",
      deleted: false
    });

    if (!orderDetail) {
      res.redirect(orderUrl(req.query));
      return;
    }

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNPAY_TMNCODE;
    let secretKey = process.env.VNPAY_SECRET_KEY;
    let vnpUrl = process.env.VNPAY_URL;
    let returnUrl = `${process.env.DOMAIN_WEBSITE}/order/payment-vnpay-result`;
    let orderId = `${orderDetail.code}-${orderDetail.phone}-${Date.now()}`;
    let amount = orderDetail.total;
    let bankCode = "";

    let locale = 'vn';
    if (locale === null || locale === '') {
      locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl)

  } catch (error) {
    console.log(error);
    res.redirect(orderUrl(req.query));
  }
}

function sortObject(obj) {
  if (obj == null || typeof obj !== "object") {
    throw new TypeError("obj must be an object");
  }

  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[encodeURIComponent(key)] =
      encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }

  return sorted;
}


module.exports.paymentVnpayResult = async (req, res) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  let tmnCode = process.env.VNPAY_TMNCODE;
  let secretKey = process.env.VNPAY_SECRET_KEY

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

  if (secureHash === signed) {
    // Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    const [orderCode, phone] = vnp_Params['vnp_TxnRef'].split('-');
    if (vnp_Params['vnp_ResponseCode'] === '00' && vnp_Params['vnp_TransactionStatus'] === '00') {
      await Order.updateOne({
        code: orderCode,
        phone: phone,
        deleted: false,
        status: "initial", // không ghi đè đơn đã xác nhận/hủy
      }, {
        status: "paid",
        paidAt: new Date(),
      });

      res.redirect(`${process.env.DOMAIN_WEBSITE}/order/success?orderCode=${orderCode}&phone=${phone}`);
    } else {
      res.redirect(orderUrl({ orderCode, phone }));
    }
  } else {
    res.redirect('/');
  }
}