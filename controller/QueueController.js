const {Queue, Worker} = require('bullmq');
const uuid = require('uuid');
const IORedis = require('ioredis');
const { sendReportStatus } = require('../utility/socket-io');

exports.reportQueue = new Queue('reports', { connection: new IORedis(process.env.REDIS_URL) });

exports.taskQueue = async (req, res, next) => {
    const uid = uuid.v4();

    try {
        console.log('try to add the job');
        const job = await this.reportQueue.add(uid, {form: req.body, user: req.session.user._id}, {jobId: uid});

        // When adding is successfull the user can be sure there is job registred.
        req.flash('success', `Your task <a href='/documents/${uid}' style='color: white'>${uid}</a> successfully started. Check this page in a couple of minutes`);   
        res.redirect('/documents');
    } catch (error) {
        console.log(error);
        req.flash('error', 'something went wrong')
        res.redirect('/documents')
    }
}