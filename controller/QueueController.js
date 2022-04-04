const {Queue} = require('bullmq');
const uuid = require('uuid');
const connection = require('../utility/redisConnection');
const Report = require('../models/Report');

exports.reportQueue = new Queue('reports', { connection });

exports.taskQueue = async (req, res, next) => {
    const uid = uuid.v4();
    const {customer, from_date, till_date} = req.body

    let name = `Report_${customer}_${from_date}-${till_date}`;

    let user = '12345678'
    if(req.session.user) {
        user = req.session.user._id
    }

    const regexp = new RegExp("^"+ name);

    try {
        const reportsWithName = await Report.find({name: regexp});

        if(reportsWithName.length) {
            name = `${name}_v${reportsWithName.length + 1}`;
        };

        req.body.name = name;


        console.log('try to add the job', req.body);
        const job = await this.reportQueue.add(uid, {form: req.body, user}, {jobId: uid});

        req.flash('notification', {status: 'success', message: `Your task <a href='/documents/${uid}' style='color: white'>${uid}</a> successfully started. Check this page in a couple of minutes`});   
        res.redirect('/documents');
    } catch (error) {
        console.log(error);
        req.flash('notification',{status: 'error', message: 'something went wrong'})
        res.redirect('/documents')
        throw error
    }
}

exports.cleanQueue = async (req, res) => {
    try {
        console.log('received delete request');
        await this.reportQueue.obliterate({ force: true });
        res.json({
            status: 'success',
            msg: 'done'
        })
    
    } catch (error) {
        res.status(200).send({
            status: 'error',
            msg: error
        })    
    }
}

exports.getJobs = async (req, res) => {
    let newJobs = [];

    if(req.query.status) {
        const statusJobs = await this.reportQueue.getJobs([req.query.status]);
        newJobs = [...statusJobs];
    }

    return res.send(newJobs);
}

exports.deleteJob = async (req, res) => {
    console.log('ID to delete', req.body);
    res.send({msg: 'oke'})
}