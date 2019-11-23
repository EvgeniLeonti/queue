const request = require('request-promise');
const addURL = `http://localhost:8081/queue/add`;

(async () => {
    // randomly generate messages to push
    for (let i = 0; i < 120; i++) {
        await request.get(`${addURL}?message=${(new Date()).toISOString()}`);
    }
})().catch(error => {
    console.log(error);
});