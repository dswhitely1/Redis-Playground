const debug = require('debug')('socketServer');
const Redis = require('ioredis');

const redis = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST
});

redis.subscribe('socketSystem', (err, count) => {
    if (err) {
        debug('Failed to subscribe: %s', err.message);
    } else {
        debug(`Subscribed successfully!  This client is current subscribed to ${count} channels.`);
    }
})

redis.on("message", (channel, message) => {
    debug(`Received ${message} from ${channel}`)
})
