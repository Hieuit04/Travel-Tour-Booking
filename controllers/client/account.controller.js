const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const googleClient = require("../../configs/google.config");
const AccountClient = require("../../models/accounts-clients.model");
const OtpVerification = require("../../models/otp-verification.model");
const sendMail = require("../../helpers/mail.helper")
const randomNumber = require("../../helpers/generate.helper")

module.exports.login = (req, res) =>{
    res.render("client/pages/login", {
        pageTitle: "Đăng nhập",
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
}
module.exports.loginPost = async (req, res) => {
    try{
        const {email, passWord, rememberPassword} = req.body;
        const existAccount = await AccountClient.findOne({email: email});
        if(!existAccount){
            return res.json({
                code: "error",
                message: "Email không tồn tại!",
            });
        }
        console.log("Mật khẩu nhập vào:", passWord);
        console.log("Mật khẩu trong CSDL:", existAccount);
        const isMatchPassword = await bcrypt.compare(passWord, existAccount.passWord);
        if(!isMatchPassword){
            return res.json({
                code: "error",
                message: "Mật khẩu không chính xác!",
            });
        }
        if(existAccount.status !== "active"){
            return res.json({
                code : "error",
                message: "Tài khoản của bạn đang bị khóa!",
            })
        }
        // Tạo token JWT
        const token = jwt.sign(
            {
                id: existAccount._id,
                email: existAccount.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: rememberPassword ? '7y' : '1h' } // Nếu nhớ mật khẩu thì token tồn tại 7 ngày, ngược lại 1 giờ
        );
        res.cookie("token", token, {
            maxAge: rememberPassword ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000, // Nếu nhớ mật khẩu thì cookie tồn tại 7 ngày, ngược lại 1 giờ
            httpOnly: true,
            secure: true, 
            sameSite: "strict", // Ngăn chặn CSRF
        })
        res.json({
            code: "success",
            message: "Đăng nhập thành công!",
        })

    }catch(err){
        console.log(err);
        res.json(
            {
                code: "error",
                message: "Đã xảy ra lỗi khi đăng nhập!"
            }
        )
    }
}

module.exports.register = (req, res) =>{
    res.render("client/pages/register", {
        pageTitle: "Đăng ký",
    });
}

module.exports.registerPost = async (req, res) => {
    try{
        const {fullName, email, passWord} = req.body;
        const existAccount = await AccountClient.findOne({email: email});
        if(existAccount){
            return res.json({
                code: "error",
                message: "Email đã tồn tại!",
            });
            return;
        }

        // Gửi mã OTP xác thực đăng ký
        const existOtp = await OtpVerification.findOne({email: email});
        if(existOtp){
            return res.json({
                code: "error",
                message:"Vui lòng gửi lại yêu cầu sau 5 phút!",
            })
            return;
        }
        const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên 
        const hashPassword = await bcrypt.hash(passWord, salt);
        req.session.registerData={
            fullName: fullName,
            email: email,
            passWord: hashPassword,
        }

        // Tạo mã OTP và lưu vào CSDL
        const otp = randomNumber.randomNumberString(6);
        console.log("Mã OTP: ", otp);
        const newRecord =  new OtpVerification({
            email: email,
            otp: otp,
            purpose: "register",
            expireAt: new Date(Date.now() + 5 * 60 * 1000), // Thời gian hết hạn là 5 phút
        });
        await newRecord.save();
        const subject = "[28.Admin] Mã OTP đăng ký";
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
                        <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1e293b;">Xác nhận đăng ký tài khoản</h2>
                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                            Cảm ơn bạn đã đăng ký tài khoản. Sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký:
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
        sendMail.sendMail(email, subject, content);
        console.log(email);
        res.json({
            code: "success",
            message: "Đã gửi mã OTP đến email của bạn", // Gửi mã OTP đến email của người dùng
        });
        // Gửi email xác thực OTP
    }catch(err){
        console.log(err);
        res.json({
            code: "error",
            message: "Đã xảy ra lỗi khi đăng ký tài khoản!"
        });
    }
}

module.exports.forgotPassword = (req, res) =>{
    res.render("client/pages/forgot-password", {
        pageTitle: "Quên mật khẩu",
    });
}
module.exports.forgotPasswordPost =  async (req, res) => {
    try{
        const {email} = req.body;
        const existAccount = await AccountClient.findOne({email: email});
        if(!existAccount){
            return res.json({
                code: "error",
                message: "Email không tồn tại!",
            });
        }

        // Tạo mã OTP và lưu vào CSDL
        const otp = randomNumber.randomNumberString(6);
        console.log("Mã OTP: ", otp);
        const newRecord =  new OtpVerification({
            email: email,
            otp: otp,
            purpose: "forgot-password",
            expireAt: new Date(Date.now() + 5 * 60 * 1000), // Thời gian hết hạn là 5 phút
        });
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
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã xác thực bên dưới để tiếp tục:
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
    }catch(err){
        console.log(err);
        res.json({
            code: "error",
            message: "Đã xảy ra lỗi khi quên mật khẩu!"
        })
    }
}

module.exports.otpVerification = (req, res) =>{
    const email = req.query.email;
    console.log("Email trong session:", email);
    res.render("client/pages/otp-verification", {
        pageTitle: "Xác thực OTP",
        email: email,
    });
};

module.exports.otpVerificationPost = async(req, res) =>{
    try{
        const {email, otp} = req.body;
        const otpRecorde = await OtpVerification.findOne({email: email, otp: otp});
        if(!otpRecorde){
            res.json({
                code: "error",
                message: "Mã OTP không hợp lệ!"
            });
            return;
        }
        if(otpRecorde.expireAt < new Date()){
            res.json({
                code: "error",
                message: "Mã OTP đã hết hạn!"
            });
            return;
        }
        const registerData = otpRecorde.purpose === "register"
            ? req.session.registerData
            : null;
        if (otpRecorde.purpose === "register" && !registerData) {
            return res.status(400).json({
                code: "error",
                message: "Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.",
            });
        }
        if (otpRecorde.purpose === "register" && registerData.email !== email) {
            return res.status(400).json({
                code: "error",
                message: "Email không khớp với phiên đăng ký.",
            });
        }
        // Xóa bản ghi OTP sau khi xác thực thành công
        await OtpVerification.deleteOne({email: email, otp: otp});

        // Xác thực OTP thành công, tiến hành tạo tài khoản mới
        if(otpRecorde.purpose === "register") {
            const { fullName, email, passWord, googleId} = registerData;
            const newAccount = new AccountClient({
                fullName: fullName,
                email: email,
                passWord: passWord,
                ...(googleId ? { googleId, authType: "google" } : {}),
                status: "active",
            });
            await newAccount.save();
            delete req.session.registerData;
            res.json({
                code: "success",
                message: "Tạo tài khoản mới thành công!",
                purpose: "register",
            });
            return;
        }
        if(otpRecorde.purpose === "forgot-password") {
            const existAccount = await AccountClient.findOne({email: email});
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
                message: "Xác thực OTP thành công! Vui lòng đặt lại mật khẩu.",
                purpose: "forgot-password",
            });
            return;    
            
        }
    }catch (err){
        console.log(err);
        res.json({
            code: "error",
            message: "Đã xảy ra lỗi khi xác thực OTP!"
        })

    }
}

module.exports.resetPassword = (req, res) =>{
    res.render('client/pages/reset-password', {
        pageTitle: 'Đổi mật khẩu',
    });
}
module.exports.resetPasswordPost = async(req, res) =>{
    try{
        const { passWord } = req.body;
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, email } = decoded;
        const existAccount = await AccountClient.findOne({ _id: id, email: email, status: "active" });
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
    }catch(err){
        console.log(err);
        return res.JSON({
            code: "error",
            message: "Dữ liệu không hợp lệ hoặc đã hết hạn!"
        })
    }
}

module.exports.googleLoginPost = async(req, res) => {
    try{
        const {credential} = req.body;
        // Kiểm tra credential
        if(!credential){
            return res.status(400).json({
                code: "error",
                message: "Không nhận được thông tin xác thực từ Google!"
            });
        }
        // Xác thực Google ID Token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        // Lấy thông tin user từ Google
        const payload = ticket.getPayload();
        const{
            sub: googleId,
            email,
            name,
            picture,
            email_verified
        } = payload;
        // Kiểm tra email
        if(!email_verified){
            return res.status(400).json({
                code: "error",
                message: "Email Google chưa xác thực!"
            });
        }
        // Tìm tài khoản bằng email
        const existAccount = await AccountClient.findOne({
            email: email
        });
        if(!existAccount){
            // Tạo JWT tạm để hoàn tất đăng ký.
            const registerToken = jwt.sign(
                {
                    googleId: payload.sub,
                    email: payload.email,
                    fullName: payload.name,
                    purpose: "complete-register"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "10m",
                }
            )
            res.cookie("registerToken", registerToken, {
                maxAge: 10 * 60 * 1000,
                httpOnly: true,
                secure: true, 
                sameSite: "strict", // Ngăn chặn CSRF
            })
            return res.json({
                code: "complete-register",
                message: "Hoàn tất đăng ký tài khoản mới!"
            });
        }
        else{
            if(existAccount.status !== "active"){
                return res.json({
                    code: "error",
                    message: "Tài khoản của bạn đang bị khóa!"
                });
            }
            if(!existAccount.googleId){
                existAccount.googleId = googleId;
                existAccount.authType = "google";
                await existAccount.save();
            }
        }
        // Tạo token JWT
        const token = jwt.sign(
            {
                id: existAccount._id,
                email: existAccount.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
        res.cookie("token", token, {
            maxAge: 1 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true, 
            sameSite: "strict", // Ngăn chặn CSRF
        })
        res.json({
            code: "success",
            message: "Đăng nhập thành công!",
        })
    } catch(err){
        console.log(err);
        return res.status(401).json({
            code: "error",
            message: "Đăng nhập bằng Google thất bại!"
        })
    }
};

module.exports.completeRegister = (req, res) => {
    try {
        const payload = jwt.verify(
            req.cookies.registerToken,
            process.env.JWT_SECRET
        );
        if (payload.purpose !== "complete-register") {
            return res.json({
                code: "error",
                message: "Lỗi hoàn tất đăng ký"
            })
        }
        return res.render("client/pages/complete-register", {
            pageTitle: "Hoàn tất đăng ký",
            fullName: payload.fullName,
            email: payload.email,
        });
    } catch (err) {
        res.clearCookie("registerToken");
        return res.redirect("/account/login")
    }
}
module.exports.completeRegisterPost = async (req, res) =>{
    try{
        const account = req.body;
        const registerToken = req.cookies.registerToken;
        if(!registerToken){
            return res.status(401).json({
                code: "error",
                message: "Phiên đăng ký đã hết hạn!",
            });
        }

        const payload = jwt.verify(
            registerToken,
            process.env.JWT_SECRET
        );

        if (payload.purpose !== "complete-register") {
            return res.status(401).json({
                code: "error",
                message: "Phiên đăng ký không hợp lệ!",
            });
        }

        const existAccount = await AccountClient.findOne({ email: payload.email });
        if(existAccount){
            res.clearCookie("registerToken");
            return res.json({
                code: "error",
                message: "Email này đã được đăng ký!",
            });
        }

        // Gửi mã OTP xác thực đăng ký
        const existOtp = await OtpVerification.findOne({
            email: payload.email,
            purpose: "register",
        });
        if(existOtp){
            return res.json({
                code: "error",
                message:"Vui lòng gửi lại yêu cầu sau 5 phút!",
            })
        }
        const salt = await bcrypt.genSalt(10); // Tạo chuỗi ngẫu nhiên 
        const hashPassword = await bcrypt.hash(account.passWord, salt);
        req.session.registerData={
            googleId: payload.googleId,
            fullName: account.fullName,
            email: payload.email,
            passWord: hashPassword,
        }

        // Tạo mã OTP và lưu vào CSDL
        const otp = randomNumber.randomNumberString(6);
        console.log("Mã OTP: ", otp);
        const newRecord =  new OtpVerification({
            email: payload.email,
            otp: otp,
            purpose: "register",
            expireAt: new Date(Date.now() + 5 * 60 * 1000), // Thời gian hết hạn là 5 phút
        });
        await newRecord.save();
        const subject = "[28.Admin] Mã OTP đăng ký";
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
                        <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1e293b;">Xác nhận đăng ký tài khoản</h2>
                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                            Cảm ơn bạn đã đăng ký tài khoản. Sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký:
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
        sendMail.sendMail(payload.email, subject, content);
        res.clearCookie("registerToken");
        return res.json({
            code: "success",
            message: "Đã gửi mã OTP đến email của bạn", // Gửi mã OTP đến email của người dùng
        });
        // Gửi email xác thực OTP
    }catch(err){
        console.log(err);
        return res.status(400).json({
            code: "error",
            message: "Không thể hoàn tất đăng ký. Vui lòng đăng nhập Google lại.",
        });
    }
}

module.exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
}