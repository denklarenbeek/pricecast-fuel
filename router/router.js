const express = require('express');
const router = express.Router();

const {reportForm, getReport, getAllReports, deleteReport, getOneReport, sharereport} = require('../controller/ReportController');
const {authRoute, tokenRoute, adminRoute} = require('../controller/AuthController');
const {getProductsByCid, getAllStations, generateReport, checkConnection, getAllProducts, autoCompleteUsers, autoCompleteCustomer} = require('../controller/ApiController');
const {adminSettings, createNewProduct, checkQueue, getBenchmarkProducts, createCustomer, getCustomers, getContacts} = require('../controller/SettingsController');
const {taskQueue, cleanQueue, getJobs, deleteJob} = require('../controller/QueueController');
const {upload, resize} = require('../controller/UploadController');
const {exportcontacts} = require('../controller/CrmController');

router.get('/', authRoute, (req, res) => {
    res.render('home', {
        tools: [
            {
                name: 'PriceCast', icon: 'far fa-chart-bar', status: 'active', slug: '/pricecast'
            },
            {
                name: 'Uniti CRM', icon: 'far fa-address-card', status: 'active', slug: '/uniti-crm'
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

router.post('/waiting',authRoute, taskQueue);

router.get('/login', (req, res) => res.render('login'));

router.get('/register', tokenRoute, (req,res) => {res.render('2fa', {email: req.email})});

router.get('/forgot', (req, res) => {res.render('forgot')});


/* ADMINISTRATOR ROUTE */
router.get('/settings', authRoute, (req,res) => { res.render('settings')});
router.get('/settings/contacts', authRoute, getContacts);
router.get('/settings/admin', authRoute, adminRoute, (req,res) => { res.render('admin')});
router.get('/settings/customers', authRoute, adminRoute, getCustomers);
router.get('/settings/productmatrix', authRoute, adminRoute, getBenchmarkProducts);


/* API Routes */
router.get('/api/station/:stationId/products', authRoute, getProductsByCid)
router.get('/api/station',authRoute, getAllStations)
router.get('/api/connection', authRoute, checkConnection)
router.post('/api/products', createNewProduct);
router.post('/api/customers',authRoute, createCustomer);
router.get('/api/products',authRoute, getAllProducts);
router.get('/api/getqueue',authRoute, checkQueue);
router.delete('/api/report/:report',authRoute, deleteReport);
router.get('/api/report/:report',authRoute, getOneReport);
router.get('/api/queue/jobs',authRoute, getJobs);
router.delete('/api/queue/clean',authRoute, cleanQueue)
router.get('/api/users',authRoute, autoCompleteUsers);
router.get('/api/customers', autoCompleteCustomer);
router.get('/api/sharereport',authRoute, sharereport)
router.post('/api/upload', upload, resize)
router.get('/api/exportcontacts', exportcontacts)

module.exports = router;