const express = require('express');
const router = express.Router();
const tourController = require('../../controllers/admin/tour.controller');
const {storage} = require('../../helpers/cloundinary.helper'); // Import multer storage configuration
const multer = require('multer')
const upload = multer({ storage: storage })


router.get('/list', tourController.list);
router.get('/create', tourController.create);
router.get('/trash', tourController.trash);

router.post('/create', upload.single("avatar"),tourController.createPost);

module.exports = router;
