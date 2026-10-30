const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blog.controller');
const {checkPermission} = require('../../middlewares/admin/permission.middleware');
const settingMidelware = require('../../middlewares/client/setting.midelware');
const categoryMidelware = require('../../middlewares/client/category.midelware');

const {storage} = require('../../helpers/cloundinary.helper');

const multer  = require('multer')
const upload = multer({ storage: storage })

router.get('/list', blogController.list);

router.get('/edit/:id', blogController.edit);

router.patch(
  '/edit/:id',
  checkPermission("blog-edit"),
  upload.single("avatar"),
  blogController.editPatch
);

// Xem trước bài viết bằng giao diện trang Tin tức (cần dữ liệu header/footer của client)
router.get(
  '/preview/:id',
  settingMidelware.websiteInfo,
  categoryMidelware.list,
  blogController.preview
);

router.patch(
  '/delete/:id',
  checkPermission("blog-delete"),
  blogController.deletePatch
);

router.patch('/change-multi', blogController.changeMultiPatch);

module.exports = router;
