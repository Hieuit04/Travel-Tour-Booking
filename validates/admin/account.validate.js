const Joi = require('joi');

module.exports.registerPost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(5)
      .max(50)
      .messages({
        "string.empty": "Vui lòng điền tên!",
        "string.min": "Tên tối thiểu 5 kí tự!",
        "string.max": "Họ và tên không được quá 50 ký tự!",
      }),

    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng điền email!",
        "string.email": "Email không hợp lệ!",
      }),
    passWord: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[0-9]/.test(value)) {
          return helpers.error('password.number');
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.upercase');
        }
        if (!/[^A-Za-z0-9]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .messages({
        "string.empty": "Vui lòng điền mật khẩu!",
        "string.min": "Mật khẩu tối thiểu 8 ký tự!",
        "password.number": "Mật khẩu phải có ít nhất một số!",
        "password.lowercase": "Mật khẩu phải có ít nhất một chữ cái viết thường!",
        "password.upercase": "Mật khẩu phải có ít nhất một chữ cái viết hoa!",
        "password.special": "Mật khẩu phải có ít nhất một ký tự đặc biệt!",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message
    })
    return;
  }
  next();
} 
