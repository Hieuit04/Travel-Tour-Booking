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
  settingController.edit
);

router.patch(
  '/role/edit/:id',
  settingController.editPatch
);



module.exports = router;
