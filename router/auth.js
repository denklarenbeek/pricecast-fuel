const express = require('express');
const router = express.Router();

const {authtest, login, register, verifySecret, validateSecret} = require('../controller/AuthController');

/*
    API AUTHENTICATION ROUTES
*/
router.get('/', authtest)

// Register user & create temp_secret
router.post('/login', login)
router.post('/register', register)


router.post('/verify', verifySecret)
router.post('/validate', validateSecret)


module.exports = router;