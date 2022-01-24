const {Queue, Worker} = require('bullmq');
const uuid = require('uuid');
const IORedis = require('ioredis');

exports.reportQueue = new Queue('reports', { connection: new IORedis(process.env.REDIS_URL) });

exports.taskQueue = async (req, res, next) => {
    const uid = uuid.v4();
    const {customer} = req.body
    let user = '12345678'
    if(req.session.user) {
        user = req.session.user._id
    }

    try {
        console.log('try to add the job');
        const job = await this.reportQueue.add(uid, {form: req.body, user}, {jobId: uid});

        // When adding is successfull send the loading document to the use via res.documents
        req.flash('documents', {
            reportId: uid,
            customer
        });
        req.flash('notification', {status: 'success', message: `Your task <a href='/documents/${uid}' style='color: white'>${uid}</a> successfully started. Check this page in a couple of minutes`});   
        res.redirect('/documents');
    } catch (error) {
        console.log(error);
        req.flash('notification',{status: 'error', message: 'something went wrong'})
        res.redirect('/documents')
    }
}