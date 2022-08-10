const Report = require('../models/Report');
const {cid} = require('../config');
const moment = require('moment');
const mongoose = require('mongoose');

exports.reportForm = async (req, res, next) => {
    const customers = cid
    res.render('reportForm', {customers});
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
    let items_per_page = 10;
    let actual_page = 0;

    if(req.query.page && req.query.page !== 1) {
        actual_page = req.query.page - 1
    } 

    const id = req.session.user._id;

    const administrator = req.session.user.administrator;
    let reports;
    let count_of_documents;

    if(!administrator) {
        reports = await Report.find({sharedWith: id}).limit(items_per_page).skip(actual_page * items_per_page).sort('-createdAt').setOptions({ allowDiskUse: true }).populate({path: 'createdBy', select: '-password -secret -temp_secret'})
        count_of_documents = await Report.countDocuments({sharedWith: id});
    } else {
        reports = await Report.find().limit(items_per_page).skip(actual_page * items_per_page).sort('-createdAt').setOptions({ allowDiskUse: true }).populate({path: 'createdBy', select: '-password -secret -temp_secret'})
        count_of_documents = await Report.countDocuments();
    }
    
    for(let i = 0; i < reports.length; i++) {
        let newCreated = moment(reports[i].createdAt).fromNow();
        reports[i].newDate = newCreated;
    }
     
    const pages = Math.ceil(count_of_documents / items_per_page);
    const page = actual_page + 1;

    res.render('documents', {reports, page, quantity: count_of_documents, pages, per_page: items_per_page });
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
    try {
        await Report.findOneAndDelete({reportId: req.params.report});
        return res.status(200).json({deleted: true});
    } catch (error) {
        console.log(error);
       return res.status(500);
    }
}

exports.sharereport = async (req, res, next) => {

    const id = req.query.id;
    const sharedWith = req.query.shared
    try {
        const report = await Report.findOne({reportId: id});
        const newReport = report;
        const newId = mongoose.Types.ObjectId(sharedWith);
        console.log(newId)
        const isAlreadyThere = newReport.sharedWith.includes(sharedWith);

        if(isAlreadyThere) {
            req.flash('notification', {status: 'error', message: 'That user already had access'});
            return res.send({status: "error", msg: "that one already has access"})
        } else {
            newReport.sharedWith.push(newId);
        }   

        const result = await Report.findOneAndUpdate({reportId: id}, newReport, {new: true});
        req.flash('notification', {status: 'success', message: 'shared the document with the user'});
        res.send({status: 'success' })
    } catch (error) {
        req.flash('notification', {status: 'error', message: 'Something went wrong while sharing'});
    }

}