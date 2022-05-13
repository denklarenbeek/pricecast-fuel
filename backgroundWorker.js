const { Worker, QueueEvents } = require('bullmq');
const { requestData } = require('./controller/DataController');
const connection = require('./utility/redisConnection');
const socketApi = require('./utility/socket-io');
const Report = require('./models/Report');
const {send} = require('./utility/email');

const MailWorker = new Worker('mail', async (job) => {
    const info = job.data;

    console.log('insdie the mail worker')

    try {
        const emailInformation = await send({
            from: info.from,
            user: {
                email: info.user.email,
                name: info.user.name
            },
            filename: info.filename,
            subject: info.subject,
            sales_rep: info.sales_rep
        });
        console.log('mail succesfully send')
    } catch (error) {
        console.log('errror', error.message)
    }
   
}, { connection });

// Worker initialization
const ReportWorker = new Worker('reports', async(job) => {

    let formInfo = {
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
            sharedWith: [job.data.user],
            customer: job.data.form.customer,
            status: 'inprogress'
        };

        await Report.create(newReport);
        const data = await requestData(formInfo, job.id, job.user);

        return { msg: 'done', status: 200, data }

    } catch (error) {
        // console.log(error);        
        console.log(error.message);        
    }

}, { connection });

const queueEvents = new QueueEvents('reports', { connection });

queueEvents.on('completed', async (job) => {
    const {jobId, returnvalue} = job;

    if(!returnvalue) {
        const response = await Report.findOneAndUpdate({reportId: jobId}, {status: 'failed'}, {new: true});
        socketApi.sendNotification(jobId, 'error', 'Something went wrong', response.createdBy.toHexString());
        console.log(`${jobId} failed to success`, response);
    } else {
        const userID = returnvalue.data.createdBy
        console.log(`Job ${jobId} which was created by ${userID} has finished`);
        socketApi.sendNotification(jobId, 'completed', returnvalue.data, userID);
    }
});

queueEvents.on('failed', async (jobId) => {
    // jobId received a progress event
    socketApi.sendNotification(null, 'error', {jobId, msg: 'error occurs in the on failed handler'});
    // const report = await Report.find({reportId: jobId});
    // const newreport = {...report};
    // newreport.status = 'failed';
    // await Report.findOneAndUpdate({reportId: jobId}, newreport);
    // console.log('FAILED', jobId, failedReason);
});

queueEvents.on('error', async (jobId) => {
    socketApi.sendNotification(null, 'error', {jobId, msg: 'Error occurs in the error handler'});
    console.log('erros occurs in the queue, catched by the on error handler')
});

module.exports = ReportWorker;