const express = require('express');
const router = express.Router();
const accountRouters = require('./account.route');

router.use('/account', accountRouters);

module.exports = router;

