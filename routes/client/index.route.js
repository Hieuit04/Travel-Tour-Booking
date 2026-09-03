const express = require('express');
const router = express.Router();
const tourRouters = require('./tour.route');
const homeRouters = require('./home.route');

router.use('/', homeRouters);
router.use('/tour', tourRouters);

module.exports = router;

