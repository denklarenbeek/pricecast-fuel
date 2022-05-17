const express = require('express');
const router = express.Router()

const {getAllContacts, CrmForm, createNewContact} = require('../controller/CrmController');
const {upload, resize} = require('../controller/UploadController')

router.get('/', getAllContacts);
router.get('/new', CrmForm);
router.post('/', createNewContact)


module.exports = router;