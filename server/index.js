const express = require('express');
const Redis = require('ioredis');
const {Kafka, logLevel} = require('kafkajs');

const redis = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST
});

const BROKERS = process.env.KAFKA_HOST.split(',')

const kafka = new Kafka({
    brokers: BROKERS,
    logLevel: logLevel.INFO
})

const producer = kafka.producer();

const app = express();
app.use(express.json());

app.post('/kafka-message', (req, res) => {
    const topic = 'socketSystem';
    const messages = [{ value: JSON.stringify(req.body)}]
    producer.send({ topic, messages });
    res.send('OK');
})

app.post('/message', (req, res) => {
    redis.publish('socketSystem', JSON.stringify(req.body));
    res.send('OK');
})

app.post('/comm', (req, res) => {
    const topic = 'commProcess';
    const messages = [{ value: JSON.stringify(req.body)}];
    producer.send({ topic, messages });
    res.send('OK');
})

app.get('/', (req, res) => res.send('Working'));

// Giving Kafka a chance to finish booting
setTimeout(() => {
    producer.connect().then(() => {
        app.listen(3000, () => console.log('Server listening on port 3000'))
    });
}, 15000)
