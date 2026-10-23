const express = require("express");
const router = express.Router();
const accountController = require("../../controllers/client/account.controller");
const accountValidate = require("../../validates/client/account.validate");

router.get("/login", accountController.login);
router.post("/login", accountValidate.loginPost, accountController.loginPost);

router.get("/register", accountController.register);
router.post("/register", accountValidate.registerPost, accountController.registerPost);

router.get("/forgot-password", accountController.forgotPassword);
router.post("/forgot-password", accountValidate.forgotPasswordPost, accountController.forgotPasswordPost);

router.get("/otp-verification", accountController.otpVerification);
router.post("/otp-verification", accountValidate.otpVerificationPost, accountController.otpVerificationPost);

router.get("/reset-password", accountController.resetPassword);
router.post("/reset-password", accountValidate.resetPasswordPost, accountController.resetPasswordPost);

router.post("/auth/google", accountController.googleLoginPost);

router.get("/complete-register", accountController.completeRegister);
router.post("/complete-register", accountValidate.completeRegisterPost, accountController.completeRegisterPost);

router.get("/logout", accountController.logout);

module.exports = router;