const { randomNumberString } = require('../../helpers/generate.helper');
const Order = require('../../models/order.model');
const Tour = require('../../models/tour.model');
const City = require('../../models/city.model');

const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment');
const variableConfig = require('../../configs/variable.config');
const { callbackPromise } = require('nodemailer/lib/shared');

module.exports.createPost = async (req, res) => {
  try {
    // mã đơn hàng
    while (true) {
      req.body.code = `OD${randomNumberString(8)}`
      const existOrder = await Order.findOne({ code: req.body.code });
      if (!existOrder) break;
    }
    req.body.subTotal = 0;
    // Danh sách tour 
    for (const item of req.body.items) {
      const tourDetail = await Tour.findOne({ _id: item.tourId });
      if (!tourDetail) {
        return res.json({
          code: "error",
          message: "Tour không tồn tại",
        })
      }
      item.avatar = tourDetail.avatar;
      item.tourName = tourDetail.tourName;
      item.slug = tourDetail.slug;
      item.newPriceAdult = tourDetail.newPriceAdult;
      item.newPriceChildren = tourDetail.newPriceChildren;
      item.newPriceBaby = tourDetail.newPriceBaby;
      item.departureDate = tourDetail.departureDate;

      if (item.locationForm) {
        const city = await City.findOne({ _id: item.locationForm });
        if (city) item.cityName = city.name;
      }

      req.body.subTotal += (item.newPriceAdult * item.quantityAdult) + (item.newPriceChildren * item.quantityChildren) + (item.newPriceBaby * item.quantityBaby);
    }
    req.body.discount = 0;
    req.body.total = req.body.subTotal - req.body.discount;
    req.body.paymentStatus = "unpaid";
    req.body.status = "initial";

    const order = new Order(req.body);
    await order.save();

    res.json({
      code: "success",
      message: "Đặt hàng thành công",
      orderCode: req.body.code,
    })
  } catch (error) {
    console.log(error);
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
      paymentStatusList: variableConfig.paymentStatusList,
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
      deleted: false
    });

    if (!orderDetail) {
      res.redirect('/');
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
      res.redirect('/');
    }
  } catch (error) {
    console.log(error);
    res.redirect('/');
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
        deleted: false
      }, {
        paymentStatus: "paid", // cập nhật trạng thái thanh toán
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
      deleted: false
    });

    if (!orderDetail) {
      res.redirect('/');
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
    res.redirect('/');
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
    if (vnp_Params['vnp_ResponseCode'] === '00' && vnp_Params['vnp_TransactionStatus'] === '00') {
      const [orderCode, phone] = vnp_Params['vnp_TxnRef'].split('-');
      await Order.updateOne({
        code: orderCode,
        phone: phone,
        deleted: false
      }, {
        paymentStatus: "paid", // cập nhật trạng thái thanh toán
      });

      res.redirect(`${process.env.DOMAIN_WEBSITE}/order/success?orderCode=${orderCode}&phone=${phone}`);
    } else {
      res.redirect('/');
    }
  } else {
    res.redirect('/');
  }
}