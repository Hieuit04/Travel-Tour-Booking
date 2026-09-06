var jwt = require('jsonwebtoken');
const AccountAdmin = require('../../models/accounts-admin.model');

module.exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    const { id, email } = decoded;
    const existAccount = await AccountAdmin.findOne({
      _id: id,
      email: email,
      status: "active",
    });
    if (!existAccount) {
      res.clearCookie('token');
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    next();
  } catch (error) {
    console.log(error);
    res.clearCookie('token');
    res.redirect(`/${pathAdmin}/account/login`);
  }
}