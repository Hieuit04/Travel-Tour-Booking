var jwt = require('jsonwebtoken');
const AccountAdmin = require('../../models/accounts-admin.model');
const Role = require('../../models/role.model');
const systemConfig = require('../../configs/variable.config');

module.exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.redirect(`/${systemConfig.pathAdmin}/account/login`);
      return;
    }
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;
    const existAccount = await AccountAdmin.findOne({
      _id: id,
      email: email,
      status: "active",
    });
    if (!existAccount) {
      res.clearCookie('token');
      res.redirect(`/${systemConfig.pathAdmin}/account/login`);
      return;
    }
    res.locals.account = existAccount;

    const role= await Role.findOne({
      _id: existAccount.role,
    })
    res.locals.role=role;
    res.locals.pers=role.rolePermissions;
    next();
  } catch (error) {
    console.log(error);
    res.clearCookie('token');
    res.redirect(`/${systemConfig.pathAdmin}/account/login`);
  }
}