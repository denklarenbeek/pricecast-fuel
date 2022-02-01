const { Worker, QueueEvents } = require('bullmq');
const { requestData } = require('./controller/DataController');
const connection = require('./utility/redisConnection');
const socketApi = require('./utility/socket-io');
const Report = require('./models/Report');

// Worker initialization
const ReportWorker = new Worker('reports', async(job) => {

    let obj = {
        body: job.data.form,
        user: job.data.user
    }

    try {
        
        // First create a report based on the ID so on reload we can show that the report is still loading
        // report needs to have a createdBy, reportID, Name, Customer & status of inprogress
        const newReport = {
            reportId: job.id,
            name: job.data.form.name,
            createdBy: job.data.user,
            customer: job.data.form.customer,
            status: 'inprogress'
        };

        await Report.create(newReport);
        const data = await requestData(obj, job.id, job.user);

        return { msg: 'done', status: 200, data }

    } catch (error) {
        // console.log(error);        
        console.log(error.message);        
    }

}, { connection });

ReportWorker.on('error', err => {
    console.log('error occurred')
    console.log(err);
    socketApi.sendNotification(jobId, 'error', err);
});

const queueEvents = new QueueEvents('reports', { connection });

queueEvents.on('completed', async (job) => {
    const {jobId, returnvalue} = job;

    if(!returnvalue) {
        socketApi.sendNotification(jobId, 'error', 'Something went wrong');
        await Report.findOneAndUpdate({status: 'failed'});
        console.log(`${jobId} failed to success`);
    } else {
        const userID = returnvalue.data.createdBy
        console.log(`Job ${jobId} which was created by ${userID} has finished`);
        socketApi.sendNotification(jobId, 'completed', returnvalue.data);
    }
});

queueEvents.on('failed', async (jobId, failedReason) => {
    // jobId received a progress event
    
    const report = await Report.find({reportId: jobId});
    const newreport = {...report};
    newreport.status = 'failed';
    await Report.findOneAndUpdate({reportId: jobId}, newreport);
    console.log(jobId, failedReason);
});

module.exports = ReportWorker;