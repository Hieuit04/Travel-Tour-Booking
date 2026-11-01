const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/client/blog.controller');

router.get('/', blogController.list);
router.get('/:slug', blogController.detail);
module.exports = router;
