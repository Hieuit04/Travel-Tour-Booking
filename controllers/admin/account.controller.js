const AccountAdmin = require("../../models/accounts-admin.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randomNumber = require("../../helpers/generate.helper")
const sendMail = require("../../helpers/mail.helper")
const ForgotPassword = require("../../models/forgot-password.model")
const nodemailer = require('nodemailer');



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
    maxAge: rememberPassword ? (7 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000), // 7 ngày nếu remember true 1 ngày nếu false
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

module.exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;
  // Kiểm tra email có tồn tại trong fogot-password không
  const existRecord = await ForgotPassword.findOne({ email: email });
  if (existRecord) {
    return res.json({
      code: "error",
      message: "Vui lòng gửi lại yêu cầu sau 5 phút!",
    });
    return;
  }
  // Tạo mã OTP
  const otp = randomNumber.randomNumberString(6); // Tạo mã OTP 6 ký tự
  console.log(otp);
  // Lưu vào CSDL email và OTP, sau 5 phút tự động xoá bản ghi
  const newRecord = new ForgotPassword({
    email: email,
    otp: otp,
    expireAt: Date.now() + 5 * 60 * 1000 // 5 phút sau khi tạo mới
  })
  await newRecord.save();
  // Gửi email tự động đến email người dùng
  const subject = "[28.Admin] Mã OTP đặt lại mật khẩu";
  const content = `
      <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mã OTP Xác Thực</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 40px 15px;">
        <tr>
          <td align="center">
            <!-- Container chính -->
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e9ecef;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 32px 24px; text-align: center;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">28.ADMIN</h1>
                  <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.2px;">HỆ THỐNG QUẢN TRỊ VIÊN</p>
                </td>
              </tr>

              <!-- Nội dung chính -->
              <tr>
                <td style="padding: 36px 32px 28px 32px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1e293b;">Yêu cầu đặt lại mật khẩu</h2>
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản quản trị của bạn. Sử dụng mã xác thực bên dưới để tiếp tục:
                  </p>

                  <!-- Khung OTP -->
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 24px 0;">
                        <div style="display: inline-block; background-color: #f1f5f9; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 14px 28px; text-align: center;">
                          <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 700; color: #0284c7; letter-spacing: 6px; display: block; line-height: 1.2;">
                            ${otp}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Cảnh báo & Hạn sử dụng -->
                  <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px; padding: 12px 14px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #991b1b;">
                      <strong>Lưu ý:</strong> Mã này có hiệu lực trong <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ hệ thống.
                    </p>
                  </div>

                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                    Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc thông báo ngay cho đội ngũ kỹ thuật để bảo vệ tài khoản.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    Đây là email tự động, vui lòng không phản hồi thư này.<br>
                    &copy; 2026 28.Admin Team. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `; // Nội dung email
  sendMail.sendMail(email, subject, content)
  // ngpv caht kwve kdbd
  console.log(email);
  res.json({
    code: "success",
    message: "Đã gửi mã OTP đến email của bạn", // Gửi mã OTP đến email của người dùng
  });
}

module.exports.otpPassword = (req, res) => {
  const { email } = req.query;
  res.render('admin/pages/otp-password', {
    pageTitle: 'Nhập mã OTP',
    email: email,
  });
}

module.exports.otpPasswordPost = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Kiểm tra email và OTP có tồn tại trong forgot-password không
    const existRecord = await ForgotPassword.findOne({ email: email, otp: otp });
    if (!existRecord) {
      return res.json({
        code: "error",
        message: "Mã OTP không hợp lệ hoặc đã hết hạn!",
      });
      return;
    }
    const existAccount = await AccountAdmin.findOne({ email: email });
    const token = jwt.sign(
      {
        id: existAccount.id,
        email: existAccount.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.cookie("token", token, {
      maxAge: (24 * 60 * 60 * 1000), // 7 ngày nếu remember true 1 ngày nếu false
      httpOnly: true, // Chỉ gửi cookie qua HTTP
      secure: true, // Chỉ sử dụng khi HTTPS
      sameSite: 'strict' // Chỉ gửi cookie cho trang web gốc
    })

    res.json({
      code: "success",
      message: "Xác thực thành công!",
    });
  } catch {
    console.error("Lỗi xác thực OTP:", error);
    return res.status(500).json({
      code: "error",
      message: "Đã xảy ra lỗi máy chủ, vui lòng thử lại sau!",
    });
  }
}

module.exports.resetPassword = (req, res) => {
  res.render('admin/pages/reset-password', {
    pageTitle: 'Đổi mật khẩu',
  });
}

module.exports.resetPasswordPost = async (req, res) => {
  try {
    const { passWord } = req.body;
    const token = req.cookies.token;
    console.log(token);
    console.log(passWord);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;
    const existAccount = await AccountAdmin.findOne({ _id: id, email: email, status: "active" });
    if (!existAccount) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Không tìm thấy tài khoản!",
      });
      return;
    }
    const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên 10 ký tự 
    const hashPassWord = await bcrypt.hash(passWord, salt); // Hash mật khẩu
    existAccount.passWord = hashPassWord;
    await existAccount.save();
    res.json({
      code: "success",
      message: "Đổi mật khẩu thành công!",
    });
  }  catch {
    console.error("Lỗi xác thực OTP:", error);
    return res.status(500).json({
      code: "error",
      message: "Dữ liệu không hợp lệ hoặc đã hết hạn!",
    });
  }
}

