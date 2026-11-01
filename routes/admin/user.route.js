const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller');
const { checkPermission } = require('../../middlewares/admin/permission.middleware');

router.get('/list', userController.list);
router.get('/edit/:id', userController.edit);
router.patch('/edit/:id', checkPermission("user-edit"), userController.editPatch);
router.patch('/delete/:id', checkPermission("user-delete"), userController.deletePatch);
router.patch('/change-multi', userController.changeMultiPatch);

module.exports = router;
