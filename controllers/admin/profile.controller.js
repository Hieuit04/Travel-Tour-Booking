const { sendToQueue } = require('../../configs/rabbitmq.config');
const AccountAdmin = require('../../models/accounts-admin.model');
const jwt = require('jsonwebtoken');


module.exports.edit = (req, res) => {
  res.render('admin/pages/profile-edit', {
    pageTitle: 'Chỉnh sửa thông tin cá nhân',
  });
};

module.exports.editPatch = async (req, res) => {
  try{
    const id = res.locals.account.id;
    if(req.body.email!=res.locals.account.email){
      const existEmail = await AccountAdmin.findOne({
        email: req.body.email,
        _id: {
          $ne: id,
        }
      });
      if (existEmail) {
        res.json({
          code: "error",
          message: "Email đã tồn tại!"
        })
        return;
      }
    }
    if(req.body.phone!=res.locals.account.phone){
      const existPhone = await AccountAdmin.findOne({
        phone: req.body.phone,
        _id: {
          $ne: id,
        }
      });

      if (existPhone) {
        res.json({
          code: "error",
          message: "Số điện thoại đã tồn tại!"
        })
        return;
      }
    }
    
    const avatarPath = req.file ? req.file.path : null;
    delete req.body.avatar;
    req.body.updatedBy = id;

    await AccountAdmin.findByIdAndUpdate(id, req.body);

    if (avatarPath) {
      await sendToQueue("media_upload_queue", {
        model: "AccountAdmin",
        id: id,
        files: [{ field: "avatar", path: avatarPath, folder: "accounts-admin" }],
      });
    }

    const token = jwt.sign(
    {
      id: id,
      email: req.body.email || res.locals.account.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  res.cookie("token", token, {
    maxAge: (24 * 60 * 60 * 1000), // 1 ngày
    httpOnly: true, // Chỉ gửi cookie qua HTTP
    secure: true, // Chỉ sử dụng khi HTTPS
    sameSite: 'strict' // Chỉ gửi cookie cho trang web gốc
  })
    res.json({
      code: "success",
      message: avatarPath 
        ? "Đã cập nhật thông tin! Ảnh đại diện đang được tải lên máy chủ ngầm." 
        : "Đã cập nhật!",
    })
  }catch (error){
    console.log(error);
    res.json({
      code: 'error',
      message: 'Dữ liệu không hợp lệ!',
    });
  }
};

module.exports.changePassword = (req, res) => {
  res.render('admin/pages/profile-change-password', {
    pageTitle: 'Đổi mật khẩu',
  });
};

