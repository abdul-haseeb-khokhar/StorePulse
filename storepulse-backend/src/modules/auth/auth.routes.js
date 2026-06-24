const express = require('express')
const {signUpController, loginController, meController} = require('./auth.controller')
const protect = require("../../middleware/protect")

const router = express.Router()

router.post('/signup', signUpController);
router.post('/login', loginController);
router.get('/me', protect, meController);

module.exports = router;