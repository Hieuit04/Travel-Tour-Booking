const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category.controller');
const categoryValidate = require('../../validates/admin/category.validate');


const {storage} = require('../../helpers/cloundinary.helper'); // Import multer storage configuration

const multer  = require('multer')
const upload = multer({ storage: storage })



router.get('/list', categoryController.list);

router.get('/create', categoryController.create);

router.post(
  '/create',
  upload.single("avatar"),
  categoryValidate.categoryCreatePost, 
  categoryController.createPost
);

router.get('/edit/:id', categoryController.edit);

router.patch(
  '/edit/:id',
  upload.single("avatar"),
  categoryValidate.categoryCreatePost, 
  categoryController.editPatch
);

module.exports = router;
