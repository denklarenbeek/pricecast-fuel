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

exports.cleanQueue = async () => {
    await this.reportQueue.obliterate({ force: true });
}

exports.getAllJobs = async (req, res) => {
    if(req.query.id) {
        const id = req.query.id
        const job = await this.reportQueue.getJob(id);
        console.log(job);
        return res.send(job);
    } else {
        const newJobs = await this.reportQueue.getJobs(["active"]);

        // const newJobs = [];

        // for(const job of jobs) {
        //     const newJob = {
        //         id: job.id,
        //         form: job.data.form,
        //         created: new Date(job.timestamp),
        //     };

        //     if(job.finishedOn){
        //         console.log(job.finishedOn, job.data.form.customer)
        //         newJob.completed = true
        //     } else {
        //         newJob.completed = false
        //     };

        //     if(job.processedOn){
        //         newJob.processed = true
        //     } else {
        //         newJob.processed = false
        //     }

        //     newJobs.push(newJob);
        // }

        // // Sort on created date
        // newJobs.sort((a, b) => {
        //     return new Date(b.created)- new Date(a.created)
        // });

        return res.send(newJobs);
    }
}