const {Queue} = require('bullmq');
const uuid = require('uuid');
const IORedis = require('ioredis');
const Report = require('../models/Report');

exports.reportQueue = new Queue('reports', { connection: new IORedis(process.env.REDIS_URL) });

exports.taskQueue = async (req, res, next) => {
    const uid = uuid.v4();
    const {customer, from_date, till_date} = req.body

    let name = `Report_${customer}_${from_date}-${till_date}`;

    let user = '12345678'
    if(req.session.user) {
        user = req.session.user._id
    }

    const regexp = new RegExp("^"+ name);


    try {
        const reportsWithName = await Report.find({name: regexp});
        console.log(reportsWithName);
        if(reportsWithName.length) {
            name = `${name}_v${reportsWithName.length + 1}`;
        };

        req.body.name = name;


        console.log('try to add the job');
        const job = await this.reportQueue.add(uid, {form: req.body, user}, {jobId: uid});

        req.flash('notification', {status: 'success', message: `Your task <a href='/documents/${uid}' style='color: white'>${uid}</a> successfully started. Check this page in a couple of minutes`});   
        res.redirect('/documents');
    } catch (error) {
        console.log(error);
        req.flash('notification',{status: 'error', message: 'something went wrong'})
        res.redirect('/documents')
    }
}

exports.cleanQueue = async () => {
    await this.reportQueue.obliterate({ force: true });
}