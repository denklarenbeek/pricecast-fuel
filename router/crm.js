const express = require('express');
const router = express.Router();

const {CrmForm, createNewContact} = require('../controller/CrmController');

router.get('/', CrmForm);
router.post('/', createNewContact)


module.exports = router;