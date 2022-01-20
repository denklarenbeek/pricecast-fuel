const {Worker} = require('bullmq');
const { requestData } = require('./controller/DataController');
const IORedis = require('ioredis')

// Worker initialization
const ReportWorker = new Worker('reports', async(job) => {

    console.log('JOB info', job)

    let obj = {
        body: job.data
    }
    const data = await requestData(obj, job.id);

    console.log(`Here we should generate al the information for the report`);
    return {
        msg: 'done',
        status: 200,
        data
    }
}, { connection: new IORedis(process.env.REDIS_URL) });

ReportWorker.on('completed', (job, response) => {
    const report = response;
    console.log(report);
    
});

ReportWorker.on('failed', (job, failedReason) => {
    // Do something with the return value.
    console.log(failedReason)
});

module.exports = ReportWorker;