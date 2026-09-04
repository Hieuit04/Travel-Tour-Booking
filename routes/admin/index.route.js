const express = require('express');
const router = express.Router();
const accountRouters = require('./account.route');
const dashboardRouters = require('./dashboard.route');
const categoryRouters = require('./category.route');

router.use('/account', accountRouters);
router.use('/dashboard', dashboardRouters);
router.use('/category', categoryRouters);

module.exports = router;

