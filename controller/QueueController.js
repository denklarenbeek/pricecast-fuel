const {Queue, Worker} = require('bullmq');
const uuid = require('uuid');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL);

const reportQueue = new Queue('reports', {connection});

exports.taskQueue = async (req, res, next) => {
    const {customer, } = req.body;
    const note = 'He There this will be freaking awesome!';

    console.log(`Start adding task to queue ${customer}`);
    
    const uid = uuid.v4();

    try {
        const job = await reportQueue.add(uid, req.body, {jobId: uid});

        // When adding is successfull the user can be sure there is job registred.
        req.flash('success', `Your task ${uid} successfully started`);
        res.redirect('/documents');
    } catch (error) {
        res.status(201).send(error);
    }
}