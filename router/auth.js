const express = require('express');
const router = express.Router();

const {authtest, login, logout, register, verifySecret, validateSecret, generateToken} = require('../controller/AuthController');

/*
    API AUTHENTICATION ROUTES
*/
router.get('/', authtest)

// Register user & create temp_secret
router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register)


router.post('/verify', verifySecret)
router.post('/validate', validateSecret)

router.post('/generatetoken', generateToken)

module.exports = router;