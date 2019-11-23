const request = require('request-promise');
const express = require('express');
const app = express();
const PORT = 8081;
const consumeURL = `http://localhost:8082/consumer/consume`;
const isBusyURL = `http://localhost:8082/consumer/isBusy`;

let msgID = 0;
let messagesToBeConsumed = [];
let consumedMessages = [];

// while there is messages in the queue, try to call "consumer/consume"
setInterval(async () => {
    if (messagesToBeConsumed.length === 0) {
        return;
    }

    let isConsumerBusy = JSON.parse(await request.get(isBusyURL)).isBusy;
    if (isConsumerBusy) {
        return;
    }

    //consumer available to consume new messages
    let message = messagesToBeConsumed.reverse().pop(); // reverse to get FIFO order

    //call consume
    let result = JSON.parse(await request.get(`${consumeURL}?id=${message.id}&message=${message.content}`));
    if (!result.success) {
        messagesToBeConsumed.push(message);
        console.log(`consumer/consume failure: ${result.error}, Message ${message.id} didn't consumed.`);
        return;
    }

    consumedMessages.push(message);
    console.log(`consumer/consume success: Message ${message.id} consumed.`);


}, 1000);

// producer should call this endpoint when it wants to add some message to be consumed
app.get('/queue/add', async (req, res) => {
    let message = {id: msgID, content: req.query.message};
    messagesToBeConsumed.push(message);

    console.log(`queue/add: ${message.id}`);

    msgID++;

    res.send(`message with id = ${message.id} added to queue`);
});

// consumer should call this endpoint when after it processes the message
app.get('/queue/remove', async (req, res) => {
    let id = req.query.id;
    consumedMessages = consumedMessages.filter(message => message.id !== id);

    console.log(`queue/remove: ${id}`);

    res.send(`message with id = ${id} removed from queue`);
});

let server = app.listen(PORT, function () {
    console.log(`Example app listening at http://localhost:${PORT}`)
});