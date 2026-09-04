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

router.use('/account', accountRouters);
router.use('/dashboard', dashboardRouters);
router.use('/category', categoryRouters);
router.use('/tour', tourRouters);
router.use('/order', orderRouters);
router.use('/user', userRouters);
router.use('/contact', contactRouters);
router.use('/setting', settingRouters);
router.use('/profile', profileRouters);


router.use((req, res) => {
  res.render('admin/pages/error-404', {
    pageTitle: 'Trang không tồn tại',
  });
});

module.exports = router;

