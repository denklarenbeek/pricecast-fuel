const Report = require('../models/Report');
const {cid} = require('../config');
const moment = require('moment');
const { redisVersion } = require('../backgroundWorker');

exports.reportForm = async (req, res, next) => {
    const customers = cid
    res.render('index', {customers});
}

exports.report = async (req, res, next) => {
    const {newData} = req;
    res.render('report', {data: newData})
}

exports.getReport = async (req, res, next) => {
    const id = req.params.reportId;
    const report = await Report.findOne({reportId: id});
    res.render('report2', {report});
}

exports.getAllReports = async (req, res, next) => {
    const id = req.session.user._id;

    const administrator = req.session.user.administrator;
    let reports;

    if(!administrator) {
        reports = await Report.find({createdBy: id}).sort('-createdAt').populate({path: 'createdBy', select: '-password -secret -temp_secret'})
    } else {
        reports = await Report.find().sort('-createdAt').populate({path: 'createdBy', select: '-password -secret -temp_secret'})
    }
    
    for(let i = 0; i < reports.length; i++) {
        let newCreated = moment(reports[i].createdAt).fromNow();
        reports[i].newDate = newCreated;
    }

    res.render('documents', {reports});
};

exports.getOneReport = async(req, res) => {
    const report = await Report.findOne({reportId: req.params.report}).populate({path: 'createdBy', select: '-password -secret -temp_secret'});

    const productid = req.query.productid;
    const stationid = req.query.stationid;
    let productData;

    for(const location of report.locations){
        if(location.stationId === parseInt(stationid)) {
            for(const product of location.products) {
                if(product.productId === parseInt(productid)) {
                    console.log('found!')
                    productData = product.pricesuggestions;
                }
            }
        }
    };

    let datasetprice = [];
    let datasetmincompetitorprice = [];
    let datasetmaxcompetitorprice = []
    let datasetlabel = [];
    for(const price of productData) {
        datasetlabel.push(price.timestamp);
        datasetprice.push(price.price);
        datasetmincompetitorprice.push(price.minCompetitorPrice);
        datasetmaxcompetitorprice.push(price.maxCompetitorPrice);
    };

    return res.json({datasetlabel, datasetprice, datasetmincompetitorprice, datasetmaxcompetitorprice});
}

exports.deleteReport = async (req, res, next) => {
    console.log('route hit', req.params.report);
    try {
        await Report.findOneAndDelete({reportId: req.params.report});
        return res.status(200).json({deleted: true});
    } catch (error) {
        console.log(error);
       return res.status(500);
    }
}