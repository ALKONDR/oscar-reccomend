const express = require('express');
var bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('id: ' + req.query.id);
});

app.post('/transaction', function(req, res) {
    console.log(req.query.id);
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(8080, function () {
    console.log('Fake app listening on port 8080!');
});