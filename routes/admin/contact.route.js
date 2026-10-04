const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/admin/contact.controller');
const {checkPermission} = require('../../middlewares/admin/permission.middleware');

router.get('/list', contactController.list);

router.patch(
  '/delete/:id',
  checkPermission("contact-delete"),
  contactController.deletePatch
);

router.patch('/change-multi',contactController.changeMultiPatch);
module.exports = router;
