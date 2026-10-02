const express = require('express');
const router = express.Router();
const promotionController = require('../../controllers/admin/promotion.controller');
const { checkPermission } = require('../../middlewares/admin/permission.middleware');

router.get('/list', promotionController.list);
router.get('/create', promotionController.create);
router.get('/tours', promotionController.getTours); // API - trả về JSON
router.post('/create', checkPermission('promotion-create'), promotionController.createPost);

router.get('/edit/:id', promotionController.edit);
router.patch('/edit/:id', promotionController.editPatch);

router.patch('/delete/:id', promotionController.deletePatch);
router.patch('/change-multi', promotionController.changeMultiPatch);

module.exports = router;
