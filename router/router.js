const express = require('express');
const router = express.Router();

const {reportForm, getReport, getAllReports, deleteReport, getOneReport} = require('../controller/ReportController');
const {authRoute, tokenRoute, adminRoute} = require('../controller/AuthController');
const {getProductsByCid, getAllStations, generateReport, checkConnection, getAllProducts} = require('../controller/ApiController');
const {adminSettings, createNewProduct, checkQueue} = require('../controller/SettingsController');
const {taskQueue, cleanQueue, getJobs, deleteJob} = require('../controller/QueueController');

router.get('/', authRoute, (req, res) => {
    res.render('home', {
        tools: [
            {
                name: 'PriceCast', icon: 'far fa-chart-bar', status: 'active', slug: '/pricecast'
            },
            {
                name: 'Alarm Intake', icon: 'fas fa-file-download', status: 'under-development', slug: '/alarm-intake'
            },
            {
                name: 'Site survey', icon: 'fas fa-draw-polygon', status: 'under-development', slug: 'site-survey'
            }
        ]}
    )
})
router.get('/pricecast', authRoute, reportForm);
router.post('/report', taskQueue)
router.get('/documents/:reportId', authRoute, getReport);
router.get('/documents', authRoute, getAllReports)

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
router.get('/api/products', getAllProducts);
router.get('/api/getqueue', checkQueue);
router.delete('/api/report/:report', deleteReport);
router.get('/api/report/:report', getOneReport);
router.get('/api/queue/jobs', getJobs);
router.delete('/api/queue/clean', cleanQueue)

module.exports = router;