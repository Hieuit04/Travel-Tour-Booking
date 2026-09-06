const express = require('express');
const router = express.Router();
const accountRouters = require('./account.route');
const dashboardRouters = require('./dashboard.route');
const categoryRouters = require('./category.route');
const tourRouters = require('./tour.route');
const orderRouters = require('./order.route');
const userRouters = require('./user.route');
const contactRouters = require('./contact.route');
const settingRouters = require('./setting.route');
const profileRouters = require('./profile.route');
const { verifyToken } = require('../../middlewares/admin/auth.middleware');

router.use('/account', accountRouters);
router.use('/dashboard', verifyToken, dashboardRouters);
router.use('/category',verifyToken, categoryRouters);
router.use('/tour', verifyToken, tourRouters);
router.use('/order', verifyToken, orderRouters);
router.use('/user', verifyToken, userRouters);
router.use('/contact', verifyToken, contactRouters);
router.use('/setting', verifyToken, settingRouters);
router.use('/profile', verifyToken, profileRouters);


router.use((req, res) => {
  res.render('admin/pages/error-404', {
    pageTitle: 'Trang không tồn tại',
  });
});

module.exports = router;

