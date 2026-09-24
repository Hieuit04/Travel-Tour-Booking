const express = require('express');
const router = express.Router();
const tourController = require('../../controllers/admin/tour.controller');
const {storage} = require('../../helpers/cloundinary.helper'); // Import multer storage configuration
const multer = require('multer')
const upload = multer({ storage: storage })
const {checkPermission} = require('../../middlewares/admin/permission.middleware');


router.get('/list', tourController.list);
router.get('/create', tourController.create);
router.get('/trash', tourController.trash);

router.post(
  '/create',
  checkPermission("tour-create"),
   upload.single("avatar"), 
   tourController.createPost);

router.get(
  '/edit/:id',
  upload.single("avatar"),
  tourController.edit
);

router.patch(
  '/edit/:id',
  checkPermission("tour-edit"),
  upload.single("avatar"), 
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

router.patch('/change-multi',tourController.changeMultiPatch);

module.exports = router;
