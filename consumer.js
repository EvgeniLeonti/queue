const request = require('request-promise');
const express = require('express');
const app = express();
const PORT = 8082;
const removeURL = `http://localhost:8081/queue/remove`;

const MAX_CONSUMED_MESSAGES = 3;
let consumedMessages = [];

app.get('/consumer/consume', function (req, res) {
    let content = req.query.content;
    let msgID = req.query.id;

    if (consumedMessages.length >= MAX_CONSUMED_MESSAGES) {
        res.json({success: false, error: "MAX_CONSUMED_MESSAGES exceeded"});
        return;
    }

    // consume message - do some async long operation
    consumedMessages.push({id: msgID});

    setTimeout(async () => {
        consumedMessages = consumedMessages.filter(message => message.id !== msgID);

        // remove the message from the queue after it's being proceed
        let removeResult = await request.get(`${removeURL}?id=${msgID}`);
        console.log(`queue/remove response: ${removeResult}`);
    }, 5000);

    res.json({success: true, messageID: msgID});
});

app.get('/consumer/isBusy', (req, res) => {
    res.json({success: true, isBusy: consumedMessages.length >= MAX_CONSUMED_MESSAGES});
});

let server = app.listen(PORT, function () {
    console.log(`consumer listening at http://localhost:${PORT}`)
});