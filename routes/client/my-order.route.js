const express = require('express');
const router = express.Router();
const myOrderController = require('../../controllers/client/my-order.controller');

router.get('/', myOrderController.list);
router.patch('/cancel/:code', myOrderController.cancelPatch);
router.get('/:code', myOrderController.detail);

module.exports = router;

