const express = require('express');
const router = express.Router();
const tourRouters = require('./tour.route');
const homeRouters = require('./home.route');
const cartRouters = require('./cart.route');
const contactRouters = require('./contact.route');
const categoryRouters = require('./category.route');
const searchRouters = require('./search.route');
const orderRouters = require('./order.route');
const blogRouters = require('./blog.route');
const settingMidelware = require('../../middlewares/client/setting.midelware');
const categoryMidelware = require('../../middlewares/client/category.midelware');


router.use(settingMidelware.websiteInfo)
router.use(categoryMidelware.list)

router.use('/tour', tourRouters);
router.use('/cart', cartRouters);
router.use('/contact', contactRouters);
router.use('/category', categoryRouters);
router.use('/search', searchRouters);
router.use('/order', orderRouters);
router.use('/blog', blogRouters);
router.use('/', homeRouters);

module.exports = router;

