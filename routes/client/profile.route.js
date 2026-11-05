const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/client/profile.controller');
const { uploadDisk } = require('../../helpers/upload-disk.helper');

router.get('/', profileController.index);
router.patch('/edit', uploadDisk.single('avatar'), profileController.editPatch);
router.post('/edit', uploadDisk.single('avatar'), profileController.editPatch);

module.exports = router;
