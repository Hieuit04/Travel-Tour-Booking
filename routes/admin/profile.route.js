const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/admin/profile.controller');
const {storage} = require('../../helpers/cloundinary.helper'); // Import multer storage configuration
const multer = require('multer')
const upload = multer({ storage: storage })

router.get('/edit', profileController.edit);

router.patch('/edit', upload.single("avatar"),profileController.editPatch);

router.get('/change-password', profileController.changePassword);

module.exports = router;
