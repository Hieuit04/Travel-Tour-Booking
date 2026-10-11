const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');

router.post('/create', orderController.createPost);
router.get('/success', orderController.success);
router.get('/payment-zalopay', orderController.paymentZalopay);
router.post('/payment-zalopay-result', orderController.paymentZalopayResultPost);

module.exports = router;
