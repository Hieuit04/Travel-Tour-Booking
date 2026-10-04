const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/client/category.controller');

router.get('/:slug', categoryController.list);

module.exports = router;
