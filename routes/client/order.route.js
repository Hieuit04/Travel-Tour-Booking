const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');

router.post('/create', orderController.createPost);
router.get('/success', orderController.success);
router.get('/payment-zalopay', orderController.paymentZalopay);
router.get('/payment-vnpay', orderController.paymentVnpay);
router.post('/payment-zalopay-result', orderController.paymentZalopayResultPost);
router.get('/payment-vnpay-result', orderController.paymentVnpayResult);


module.exports = router;
