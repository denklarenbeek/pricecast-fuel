const Report = require('../models/Report');
const {cid} = require('../config');

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
    console.log(report)
    res.render('report2', {report});
}

exports.getAllReports = async (req, res, next) => {
    const reports = await Report.find({});
    res.render('documents', {reports});
}