const express = require('express');
const router = express.Router();
const registrationController = require("../controller/authaccount.js");

router.post('/register', registrationController.register);

router.post('/login', registrationController.login);

router.get('/updateform/:email', registrationController.updateform);

router.get('/skillset/:account_id', registrationController.skillset);

router.post('/updateuser', registrationController.updateuser);

router.get('/deleteaccount/:account_id', registrationController.deleteaccount);

router.get('/logout', registrationController.logout);

module.exports = router;