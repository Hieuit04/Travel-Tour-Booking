const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');

router.post('/create', orderController.createPost);

module.exports = router;
