const express = require('express');
const router = express.Router();
const accountRouters = require('./account.route');
const dashboardRouters = require('./dashboard.route');

router.use('/account', accountRouters);
router.use('/dashboard', dashboardRouters);

module.exports = router;

