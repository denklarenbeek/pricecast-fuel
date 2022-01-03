const {strategy, volumes, products} = require('./sampleData');
const {formatNumber, formatDate, duration} = require('../utility/formatting');
const {getRequest} = require('../controller/AxiosController');
const {cid} = require('../config');

exports.test = async (req, res, next) => {
    const customers = cid
    res.render('index', {customers});
}

exports.report = async (req, res, next) => {
    const {newData} = req;
    res.render('report', {data: newData})
}