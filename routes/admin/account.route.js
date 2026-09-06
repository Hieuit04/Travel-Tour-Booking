const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/admin/account.controller');
const accountValidate = require('../../validates/admin/account.validate');

router.get('/login', accountController.login); 

router.post('/login', accountValidate.loginPost, accountController.loginPost);

router.get('/register', accountController.register);

router.post('/register',  accountValidate.registerPost, accountController.registerPost);

router.get('/register-success', accountController.registerSuccess);

router.get('/logout' ,accountController.logout);

router.get('/forgot-password', accountController.forgotPassword);

router.post('/forgot-password' , accountValidate.forgotPasswordPost, accountController.forgotPasswordPost);

router.get('/otp-password', accountController.otpPassword);

router.get('/reset-password', accountController.resetPassword);

module.exports = router;
