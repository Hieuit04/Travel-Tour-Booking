const express = require('express');
const router = express.Router();
const tourController = require('../../controllers/admin/tour.controller');
const { uploadDisk } = require('../../helpers/upload-disk.helper');
const { checkPermission } = require('../../middlewares/admin/permission.middleware');


router.get('/list', tourController.list);
router.get('/create', tourController.create);
router.get('/trash', tourController.trash);
router.get('/price-suggest', tourController.priceSuggest);

router.post(
  '/create',
  checkPermission("tour-create"),
  uploadDisk.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 15 } 
  ]),
  tourController.createPost);

router.get(
  '/edit/:id',
  tourController.edit
);

router.patch(
  '/edit/:id',
  checkPermission("tour-edit"),
  uploadDisk.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 15 }
  ]),
  tourController.editPatch
);

router.patch(
  '/delete/:id',
  checkPermission("tour-delete"),
  tourController.deletePatch
);

router.patch(
  '/restore/:id',
  checkPermission("tour-trash-restore"),
  tourController.restorePatch
);

router.patch(
  '/delete-destroy/:id',
  checkPermission("tour-trash-delete"),
  tourController.deleteDestroyPatch
);

router.patch('/change-multi', tourController.changeMultiPatch);

module.exports = router;
