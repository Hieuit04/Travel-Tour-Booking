const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/admin/profile.controller');
const { uploadDisk } = require('../../helpers/upload-disk.helper');

router.get('/edit', profileController.edit);

router.patch('/edit', uploadDisk.single("avatar"), profileController.editPatch);

router.get('/change-password', profileController.changePassword);

module.exports = router;
