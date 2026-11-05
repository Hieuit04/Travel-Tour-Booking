const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category.controller');
const categoryValidate = require('../../validates/admin/category.validate');
const {checkPermission} = require('../../middlewares/admin/permission.middleware');


const { uploadDisk } = require('../../helpers/upload-disk.helper');



router.get('/list', categoryController.list);

router.get('/create', categoryController.create);

router.post(
  '/create',
  checkPermission("category-create"),
  uploadDisk.single("avatar"),
  categoryValidate.categoryCreatePost, 
  categoryController.createPost
);

router.get('/edit/:id', categoryController.edit);

router.patch(
  '/edit/:id',
  checkPermission("category-edit"),
  uploadDisk.single("avatar"),
  categoryValidate.categoryCreatePost, 
  categoryController.editPatch
);

router.patch(
  '/delete/:id',
  checkPermission("category-delete"),
  categoryController.deletePatch
);

router.patch('/change-multi',categoryController.changeMultiPatch);


module.exports = router;
