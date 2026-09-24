const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/setting.controller');
const {storage} = require('../../helpers/cloundinary.helper'); // Import multer storage configuration
const multer = require('multer')
const upload = multer({ storage: storage })


router.get('/list', settingController.list);
router.get('/website-info', settingController.websiteInfo);
router.get('/account-admin/list', settingController.accountAdminList);

router.get('/account-admin/create', settingController.accountAdminCreate);

router.post('/account-admin/create',upload.single('avatar'), settingController.accountAdminCreatePost);

router.get('/account-admin/edit/:id', settingController.accountAdminEdit);

router.patch('/account-admin/edit/:id', upload.single("avatar"), settingController.accountAdminEditPatch);

router.patch(
  '/account-admin/delete/:id',
  settingController.accountAdminDeletePatch
);

router.patch('/account-admin/change-multi', settingController.accountAdminChangeMultiPatch);

router.get('/account-admin/change-password/:id', settingController.accountAdminChangePassword);

router.patch('/account-admin/change-password/:id', settingController.accountAdminChangePasswordPatch);


router.get('/role/list', settingController.roleList);

router.get('/role/create', settingController.roleCreate);

router.patch(
  '/website-info',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
  ]),
  settingController.websiteInfoPatch
);

router.post('/role/create', settingController.roleCreatePost);

router.get(
  '/role/edit/:id',
  settingController.roleEdit
);

router.patch(
  '/role/edit/:id',
  settingController.roleEditPatch
);

router.patch(
  '/role/delete/:id',
  settingController.roleDeletePatch
);

router.patch('/role/change-multi',settingController.roleChangeMultiPatch);


module.exports = router;
