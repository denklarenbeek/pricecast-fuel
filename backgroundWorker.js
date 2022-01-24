// const server = require('./server');

const { Worker, QueueEvents } = require('bullmq');
const { requestData } = require('./controller/DataController');
const IORedis = require('ioredis')
const io = require('./server');
const socketApi = require('./utility/socket-io');

const Report = require('./models/Report');

// Worker initialization
const ReportWorker = new Worker('reports', async(job) => {

    let obj = {
        body: job.data.form,
        user: job.data.user
    }

    try {
        
        const data = await requestData(obj, job.id, job.user);
        // let data = {
        //     createdBy: 'Dennis'
        // }

        return { msg: 'done', status: 200, data }

    } catch (error) {
        console.log(error);        
        console.log(error.message);        
    }

}, { connection: new IORedis(process.env.REDIS_URL) });

ReportWorker.on('error', err => {
    console.log('error occurred')
    console.log(err);
});

const queueEvents = new QueueEvents('reports');

queueEvents.on('completed', (job) => {
    const {jobId, returnvalue} = job;
    const userID = returnvalue.data.createdBy
    console.log(`Job ${jobId} which was created by ${userID} has finished`);
    socketApi.sendNotification(jobId, 'completed', returnvalue.data);
})

queueEvents.on('progress', (job, response) => {
    // Job { jobId, data (progress) }
    console.log('worker in progress!', job);
})

// ReportWorker.on('completed', (job, response) => {
//     const report = response;

//     sendReportStatus('done', job.name);
// });

// ReportWorker.on('progress', (job, progress) => {
//     console.log(job, progress)
// });

// ReportWorker.on('failed', (job, failedReason) => {
//     // Do something with the return value.
//     console.log(failedReason)
// });

module.exports = ReportWorker;