const express = require('express');
const router = express.Router();
const tourRouters = require('./tour.route');
const homeRouters = require('./home.route');
const cartRouters = require('./cart.route');
const accountRouters = require('./account.route');
const contactRouters = require('./contact.route');
const categoryRouters = require('./category.route');
const searchRouters = require('./search.route');
const orderRouters = require('./order.route');
const profileRouters = require('./profile.route');
const settingMidelware = require('../../middlewares/client/setting.midelware');
const categoryMidelware = require('../../middlewares/client/category.midelware');
const { verifyToken } = require('../../middlewares/client/auth.middleware');
const { getAccount } = require('../../middlewares/client/get-account.middlewares');


router.use(settingMidelware.websiteInfo)
router.use(categoryMidelware.list)

router.use('/account', accountRouters);
router.use('/profile', verifyToken, profileRouters);
router.use('/tour', getAccount, tourRouters);
router.use('/cart', getAccount, cartRouters);
router.use('/contact', getAccount, contactRouters);
router.use('/category', getAccount, categoryRouters);
router.use('/search', searchRouters);
router.use('/order', getAccount, orderRouters);
router.use('/', getAccount, homeRouters);

module.exports = router;
