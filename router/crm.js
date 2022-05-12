const express = require('express');
const router = express.Router()

const {CrmForm, createNewContact} = require('../controller/CrmController');
const {upload, resize} = require('../controller/UploadController')

router.get('/', CrmForm);
router.post('/', createNewContact)


module.exports = router;