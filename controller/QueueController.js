const {Queue, Worker} = require('bullmq');
const uuid = require('uuid');
const IORedis = require('ioredis');
const { sendReportStatus } = require('../utility/socket-io');

const reportQueue = new Queue('reports', { connection: new IORedis(process.env.REDIS_URL) });

exports.taskQueue = async (req, res, next) => {
    const uid = uuid.v4();

    try {
        const job = await reportQueue.add(uid, {form: req.body, user: req.session.user._id}, {jobId: uid});

        // When adding is successfull the user can be sure there is job registred.
        req.flash('success', `Your task ${uid} successfully started. Check this page in a couple of minutes`);   
        sendReportStatus('report', 'Task created');
        res.redirect('/documents');
    } catch (error) {
        res.status(201).send(error);
    }
}