const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller.js');

router.get('/', cartController.cart);
router.get('/count', cartController.countGet);
router.post('/detail', cartController.detailPost);
router.post('/add', cartController.addPost);
router.delete('/item/:tourId', cartController.itemDelete);
router.post('/merge', cartController.mergePost);

module.exports = router;
