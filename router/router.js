const express = require('express');
const router = express.Router();

const {reportForm, getReport, getAllReports, deleteReport, getOneReport} = require('../controller/ReportController');
const {authRoute, tokenRoute, adminRoute} = require('../controller/AuthController');
const {getProductsByCid, getAllStations, generateReport, checkConnection} = require('../controller/ApiController');
const {adminSettings, createNewProduct, checkQueue} = require('../controller/SettingsController');
const {taskQueue} = require('../controller/QueueController');


router.get('/', authRoute, reportForm);
router.post('/report', taskQueue)
router.get('/documents/:reportId', getReport);
router.get('/documents', getAllReports)

router.post('/waiting', taskQueue);

router.get('/login', (req, res) => res.render('login'));

router.get('/register', tokenRoute, (req,res) => {
    res.render('2fa', {email: req.email})
});

router.get('/forgot', (req, res) => {
    res.render('forgot')
});

/* ADMINISTRATOR ROUTE */
router.get('/settings', authRoute, adminRoute, adminSettings);


/* API Routes */
router.get('/api/station/:stationId/products', getProductsByCid)
router.get('/api/station', getAllStations)
router.get('/api/connection', checkConnection)
router.post('/api/product', createNewProduct);
router.get('/api/getqueue', checkQueue);
router.delete('/api/report/:report', deleteReport);
router.get('/api/report/:report', getOneReport);
// router.post('/api/generate', generateReport);

module.exports = router;