const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.send('this is my fake data');
});

app.listen(8080, function () {
    console.log('Fake app listening on port 8080!');
});