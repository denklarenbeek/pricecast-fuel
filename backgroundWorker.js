const { Worker, QueueEvents } = require('bullmq');
const { requestData } = require('./controller/DataController');
const IORedis = require('ioredis')
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
        console.log(error);        
        console.log(error.message);        
    }

}, { connection: new IORedis(process.env.REDIS_URL) });

ReportWorker.on('error', err => {
    console.log('error occurred')
    console.log(err);
    socketApi.sendNotification(jobId, 'error', err);
});

const queueEvents = new QueueEvents('reports');

queueEvents.on('completed', (job) => {
    const {jobId, returnvalue} = job;
    const userID = returnvalue.data.createdBy
    console.log(`Job ${jobId} which was created by ${userID} has finished`);
    socketApi.sendNotification(jobId, 'completed', returnvalue.data);
});

queueEvents.on('progress', (job, response) => {
    // Job { jobId, data (progress) }
    console.log('worker in progress!', job);
});

queueEvents.on('failed', (jobId, failedReason) => {
    // jobId received a progress event
    socketApi.sendNotification(jobId, 'error', failedReason);
    console.log(jobId, failedReason);
});

module.exports = ReportWorker;