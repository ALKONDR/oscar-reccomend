const express = require('express');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api', function(req, res) {
    res.send(predict());
});

app.post('/api/transaction', function(req, res) {
    console.log(req.query.id);
    console.log(req.body);

    predictions.push(JSON.parse(req.body));

    res.sendStatus(200);
});

app.listen(8080, function () {
    console.log('Fake app listening on port 8080!');
});

// const users = require('./generated_users');
const db = require('./product_base');

const predictions = [];

function predict() {
    return db.products[Math.floor(Math.random() * db.products.length)];
}

// function getUniqueCategories(userTransactions){
//
// }