const express = require('express');
const router = express.Router();

const {test} = require('../controller/ReportController');
const {benchmark, calculateBenchmark} = require('../controller/BenchmarkController');
const {getProductsByCid, getAllStations, generateReport, checkConnection} = require('../controller/ApiController');

router.get('/', test);
router.post('/report',benchmark, calculateBenchmark, generateReport)
router.get('/report', (req, res) => {
    res.redirect(301, '/')
})

/* API Routes */
router.get('/api/station/:stationId/products', getProductsByCid)
router.get('/api/station', getAllStations)
router.get('/api/connection', checkConnection)
// router.post('/api/generate', generateReport);

module.exports = router;