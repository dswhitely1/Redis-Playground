const { Kafka, logLevel } = require("kafkajs");
const debug = require('debug')('commProcess');

const BROKERS = process.env.KAFKA_HOST.split(',');

const kafka = new Kafka({
    brokers: BROKERS,
    logLevel: logLevel.INFO
})

const consumer = kafka.consumer({ groupId: `commProcessConsumer`});
const topics = ['commProcess'];

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