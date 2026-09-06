const AccountAdmin = require("../../models/accounts-admin.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


module.exports.login = (req, res) => {
  res.render('admin/pages/login', {
    pageTitle: 'Đăng nhập',
  });
}

module.exports.loginPost = async (req, res) => {
  const { email, passWord, rememberPassword } = req.body;
  const existAccount = await AccountAdmin.findOne({ email: email });
  if (!existAccount) {
    return res.json({
      code: "error",
      message: "Email không tồn tại",
    });
    return;
  }

  const isMatchPassword = await bcrypt.compare(passWord, existAccount.passWord);
  if (!isMatchPassword) {
    return res.json({
      code: "error",
      message: "Mật khẩu không chính xác",
    });
    return;
  }

  if (existAccount.status !== "active") {
    return res.json({
      code: "error",
      message: "Tài khoản chưa được kích hoạt",
    });
    return;
  }
  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword ? "7y" : "1d"
    }
  );

  res.cookie("token", token, {
    maxAge: rememberPassword ? (7*24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000), // 7 ngày nếu remember true 1 ngày nếu false
    httpOnly: true, // Chỉ gửi cookie qua HTTP
    secure: true, // Chỉ sử dụng khi HTTPS
    sameSite: 'strict' // Chỉ gửi cookie cho trang web gốc
  })

  res.json({
    code: "success",
    message: "Đăng nhập thành công",
  });
}


module.exports.register = (req, res) => {
  res.render('admin/pages/register', {
    pageTitle: 'Đăng ký',
  });
}

module.exports.registerSuccess = (req, res) => {
  res.render('admin/pages/register-success', {
    pageTitle: 'Tài khoản đã được khởi tạo',
  });
}

module.exports.registerPost = async (req, res) => {
  req.body.status = 'initial';
  console.log(req.body);
  const existAccount = await AccountAdmin.findOne({ email: req.body.email });
  if (existAccount) {
    return res.json({
      code: "error",
      message: "Email đã tồn tại",
    });
    return;
  }
  const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên 10 ký tự 
  req.body.passWord = await bcrypt.hash(req.body.passWord, salt); // Hash mật khẩu
  const newRecord = new AccountAdmin(req.body);
  await newRecord.save();
  res.json({
    code: "success",
    message: "Đăng ký thành công",
  })
}

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`/${pathAdmin}/account/login`);
}


module.exports.forgotPassword = (req, res) => {
  res.render('admin/pages/forgot-password', {
    pageTitle: 'Quên mật khẩu',
  });
}


module.exports.otpPassword = (req, res) => {
  res.render('admin/pages/otp-password', {
    pageTitle: 'Nhập mã OTP',
  });
}

module.exports.resetPassword = (req, res) => {
  res.render('admin/pages/reset-password', {
    pageTitle: 'Đổi mật khẩu',
  });
}

