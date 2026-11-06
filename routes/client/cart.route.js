const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller.js');

router.get('/', cartController.cart);
router.post('/detail', cartController.detailPost);
router.post('/coupon', cartController.couponPost);

module.exports = router;
