const IORedis = require('ioredis');
const util = require('util');

const options = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
};

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379"

const connection = new IORedis(url, options);

// connection.monitor(function (err, monitor) {
//     // Entering monitoring mode.
//     monitor.on("monitor", function (time, args, source, database) {
//       console.log(time + ": " + util.inspect(args));
//     });
//   });

module.exports = connection;