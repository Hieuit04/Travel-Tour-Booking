const AccountClient = require('../../models/accounts-clients.model');
const jwt = require('jsonwebtoken');

module.exports.index = async(req, res) => {
  try {
    const userAccount = res.locals.account;

    if(!userAccount){
      res.redirect('/account/login')
      return res.json({
        code: "error",
        message: "Vui lòng đăng nhập!"
      });
    }
    res.render('client/pages/profile', {
      pageTitle: 'Thông tin cá nhân',
      profileUser: userAccount,
      isLoggedIn: !!res.locals.account
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
};

// [PATCH] /profile/edit and [POST] /profile/edit
module.exports.editPatch = async (req, res) => {
  try {
    const account = res.locals.account;

    // Check if account is logged in in database
    if (account && account.id) {
      const id = account.id;

      // Validate email uniqueness if changed
      if (req.body.email && req.body.email !== account.email) {
        const existEmail = await AccountClient.findOne({
          email: req.body.email.trim(),
          _id: { $ne: id },
          deleted: false
        });

        if (existEmail) {
          return res.json({
            code: 'error',
            message: 'Email đã tồn tại trên hệ thống!'
          });
        }
      }

      // Validate phone uniqueness if changed
      if (req.body.phone && req.body.phone !== account.phone) {
        const existPhone = await AccountClient.findOne({
          phone: req.body.phone.trim(),
          _id: { $ne: id },
          deleted: false
        });

        if (existPhone) {
          return res.json({
            code: 'error',
            message: 'Số điện thoại đã tồn tại trên hệ thống!'
          });
        }
      }

      // Handle avatar file upload if provided
      const updateData = {
        fullName: req.body.fullName ? req.body.fullName.trim() : account.fullName,
        email: req.body.email ? req.body.email.trim() : account.email,
        phone: req.body.phone ? req.body.phone.trim() : account.phone,
        updatedBy: id
      };

      if (req.file) {
        updateData.avatar = req.file.path;
      }

      await AccountClient.findByIdAndUpdate(id, updateData);

      // Re-issue JWT cookie if email changed
      const newToken = jwt.sign(
        {
          id: id,
          email: updateData.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      );

      res.cookie('token', newToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict'
      });

      return res.json({
        code: 'success',
        message: 'Cập nhật thông tin thành công!',
        data: {
          fullName: updateData.fullName,
          email: updateData.email,
          phone: updateData.phone,
          avatar: updateData.avatar || account.avatar
        }
      });
    }

    // In demo / preview mode without login session
    const avatarUrl = req.file ? req.file.path : undefined;
    return res.json({
      code: 'success',
      message: 'Cập nhật thông tin thành công!',
      data: {
        fullName: req.body.fullName ? req.body.fullName.trim() : 'Nguyễn Văn A',
        email: req.body.email ? req.body.email.trim() : 'nguyenvana@gmail.com',
        phone: req.body.phone ? req.body.phone.trim() : '0912345678',
        avatar: avatarUrl
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.json({
      code: 'error',
      message: 'Có lỗi xảy ra, vui lòng thử lại sau!'
    });
  }
};
