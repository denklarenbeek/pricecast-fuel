const IORedis = require('ioredis');

const options = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379"

const connection = new IORedis(url, options);

module.exports = connection;