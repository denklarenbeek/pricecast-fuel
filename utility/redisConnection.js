const IORedis = require('ioredis');

const options = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

const url = process.env.REDIS_URL

const connection = new IORedis(url, options)

module.exports = connection;