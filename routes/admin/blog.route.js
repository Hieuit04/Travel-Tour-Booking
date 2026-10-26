const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blog.controller');
const {checkPermission} = require('../../middlewares/admin/permission.middleware');

router.get('/list', blogController.list);

router.get('/edit/:id', blogController.edit);

router.patch(
  '/edit/:id',
  checkPermission("blog-edit"),
  blogController.editPatch
);

router.patch(
  '/delete/:id',
  checkPermission("blog-delete"),
  blogController.deletePatch
);

router.patch('/change-multi', blogController.changeMultiPatch);

module.exports = router;
