const {Queue, QueueScheduler} = require('bullmq');
const uuid = require('uuid');
const connection = require('../utility/redisConnection');
const Report = require('../models/Report');

const myQueueScheduler = new QueueScheduler('mail');

exports.reportQueue = new Queue('reports', { connection });
exports.mailQueue = new Queue('mail', {connection});

exports.addMailToQueue = async (req, res, next) => {
    const uid = uuid.v4();

    const options = {
        from: req.body.sales_rep.email,
        sales_rep: {
            name: req.body.sales_rep.name,
            phone: req.body.sales_rep.phone,
            email: req.body.sales_rep.email,
            picture: req.body.sales_rep.picture
        },
        user: {
            email: req.body.user.email,
            name: req.body.user.name
        },
        filename: 'thank-you',
        subject: 'Thank you for visiting our stand at Uniti'
    }

    await this.mailQueue.add(uid, options, {delay: 1800000 });

}

exports.taskQueue = async (req, res, next) => {
    
    console.log(req.body);
    const uid = uuid.v4();
    const {customer, from_date, till_date} = req.body

    let name = `Report_${customer}_${from_date}-${till_date}`;

    let user = '61dd4c3b4cbea38bb8f932f6'
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

        const job = await this.reportQueue.add(uid, {form: req.body, user}, {jobId: uid});
        console.log(`Job added at ${Date.now()}`);

        req.flash('notification', {status: 'success', message: `Your task <a href='/documents/${uid}' style='color: white'>${uid}</a> successfully started. Check this page in a couple of minutes`});   
        res.status(200).json({status: "success"});
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