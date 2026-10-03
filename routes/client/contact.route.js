const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/client/contact.controller');

router.post('/create', contactController.create);

module.exports = router;
