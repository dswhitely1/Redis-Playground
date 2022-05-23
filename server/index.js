const express = require('express');
const Redis = require('ioredis');

const redis = new Redis({
    port: 6379,
    host: process.env.REDIS_HOST
});

const app = express();
app.use(express.json());

app.post('/message', (req, res) => {
    redis.publish('socketSystem', JSON.stringify(req.body));
    res.send('OK');
})

app.get('/', (req, res) => res.send('Working'));

app.listen(3000, () => console.log('Server listening on port 3000'))