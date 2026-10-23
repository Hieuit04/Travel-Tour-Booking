const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/client/profile.controller');
const { storage } = require('../../helpers/cloundinary.helper');
const multer = require('multer');
const upload = multer({ storage: storage });

router.get('/', profileController.index);
router.patch('/edit', upload.single('avatar'), profileController.editPatch);
router.post('/edit', upload.single('avatar'), profileController.editPatch);

module.exports = router;
