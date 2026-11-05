const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/setting.controller');
const { uploadDisk } = require('../../helpers/upload-disk.helper');
const {checkPermission} = require('../../middlewares/admin/permission.middleware');


router.get('/list', settingController.list);
router.get('/website-info', settingController.websiteInfo);
router.get('/account-admin/list', settingController.accountAdminList);

router.get('/account-admin/create', settingController.accountAdminCreate);

router.post(
  '/account-admin/create',
  checkPermission("account-admin-create"),
  uploadDisk.single('avatar'),
  settingController.accountAdminCreatePost
);

router.get('/account-admin/edit/:id', settingController.accountAdminEdit);

router.patch(
  '/account-admin/edit/:id',
  checkPermission("account-admin-edit"),
  uploadDisk.single("avatar"),
  settingController.accountAdminEditPatch
);

router.patch(
  '/account-admin/delete/:id',
  checkPermission("account-admin-delete"),
  settingController.accountAdminDeletePatch
);

router.patch('/account-admin/change-multi', settingController.accountAdminChangeMultiPatch);

router.get(
  '/account-admin/change-password/:id',
  settingController.accountAdminChangePassword
);

router.patch(
  '/account-admin/change-password/:id',
  checkPermission("account-admin-change-password"),
  settingController.accountAdminChangePasswordPatch
);


router.get('/role/list', settingController.roleList);

router.get('/role/create', settingController.roleCreate);

router.patch(
  '/website-info',
  checkPermission("website-info-edit"),
  uploadDisk.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
  ]),
  settingController.websiteInfoPatch
);

router.post(
  '/role/create',
  checkPermission("role-create"),
  settingController.roleCreatePost
);

router.get(
  '/role/edit/:id',
  settingController.roleEdit
);

router.patch(
  '/role/edit/:id',
  checkPermission("role-edit"),
  settingController.roleEditPatch
);

router.patch(
  '/role/delete/:id',
  checkPermission("role-delete"),
  settingController.roleDeletePatch
);

router.patch('/role/change-multi',settingController.roleChangeMultiPatch);


module.exports = router;
