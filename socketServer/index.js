const debug = require('debug')('socketServer');
const Redis = require('ioredis');
const {Kafka, logLevel} = require('kafkajs');
const os = require('os');

const redis = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST
});

const BROKERS = process.env.KAFKA_HOST.split(',');

const kafka = new Kafka({
    brokers: BROKERS,
    logLevel: logLevel.INFO
})

const consumer = kafka.consumer({ groupId: `socketServerConsumer-${os.hostname()}`});
const topics = ['socketSystem'];

redis.subscribe('socketSystem', (err, count) => {
    if (err) {
        debug('Failed to subscribe: %s', err.message);
    } else {
        debug(`Subscribed successfully!  This client is current subscribed to ${count} channels.`);
    }
})

redis.on("message", (channel, message) => {
    debug(`Received ${JSON.stringify(JSON.parse(message), null, 2)} from ${channel}`)
})

const init = async () => {
    await consumer.connect();
    await Promise.all(topics.map(t => consumer.subscribe({ topic: t})))
    return consumer.run({
        eachMessage: async ({ topic, message }) => {
            debug(`Received ${JSON.stringify(JSON.parse(message.value.toString()), null, 2)} on topic: ${topic}`)
        }
    })
}

// Giving Kafka a chance to finish booting
setTimeout(() => {
    init().catch((error) => {
        debug('Error Starting service', JSON.stringify(error, null, 2))
    })
}, 15000)
