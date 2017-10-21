const express = require('express');
const app = express();

app.get('/', function(req, res) {
    res.send('id: ' + req.query.id);
});

app.post('/transaction', function(req, res) {
    console.log(req.query.id);
    console.log(req.body);
});

app.listen(8080, function () {
    console.log('Fake app listening on port 8080!');
});