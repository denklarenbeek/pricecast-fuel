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