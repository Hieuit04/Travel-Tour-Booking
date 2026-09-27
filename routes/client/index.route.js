const express = require('express');
const router = express.Router();
const tourRouters = require('./tour.route');
const homeRouters = require('./home.route');
const cartRouters = require('./cart.route');
const settingWebsiteInfo = require('../../middlewares/client/setting.midelware');


router.use(settingWebsiteInfo.websiteInfo)

router.use('/tour', tourRouters);
router.use('/cart', cartRouters);
router.use('/', homeRouters);

module.exports = router;

