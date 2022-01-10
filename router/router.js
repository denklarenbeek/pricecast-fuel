const express = require('express');
const router = express.Router();

const {test} = require('../controller/ReportController');
const {authRoute, tokenRoute} = require('../controller/AuthController');
const {benchmark, calculateBenchmark} = require('../controller/BenchmarkController');
const {getProductsByCid, getAllStations, generateReport, checkConnection} = require('../controller/ApiController');
const {adminSettings, createNewProduct} = require('../controller/SettingsController');


router.get('/', authRoute, test);
router.post('/report',benchmark, calculateBenchmark, generateReport)
router.get('/report', (req, res) => {
    res.redirect(301, '/')
});

router.post('/benchmark', benchmark, calculateBenchmark);

router.get('/login', (req, res) => res.render('login'));

router.get('/register', tokenRoute, (req,res) => {
    res.render('2fa', {email: req.email})
});

router.get('/forgot', (req, res) => {
    res.render('forgot')
});

/* ADMINISTRATOR ROUTE */
router.get('/settings', adminSettings);


/* API Routes */
router.get('/api/station/:stationId/products', getProductsByCid)
router.get('/api/station', getAllStations)
router.get('/api/connection', checkConnection)
router.post('/api/product', createNewProduct);
// router.post('/api/generate', generateReport);

module.exports = router;