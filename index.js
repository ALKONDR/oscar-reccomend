const express = require('express');
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api', function(req, res) {
    console.log('GET /api ', req.query);

    res.send(predictions.pop() || "");
});

app.post('/api/transaction', function(req, res) {
    console.log('POST /api/transaction', req.body);

    processsTransaction(req.body);

    res.sendStatus(200);
});

app.listen(8080, function () {
    console.log('Oscar is listening on port 8080');
});

const rwc = require('random-weighted-choice');

const users = require('./all_users').users;
const defaultUser = require('./default_user');

const predictions = [{ product: 'Шок.батончик TWIX Extra 82г',
    category: 'Батончики, шоколадные яйца, драже',
    price: 45.5,
    actualPrice: 40.11 }];

function processsTransaction(transaction) {
    defaultUser.transactions.push(transaction);

    const ourUserTransactions = getLastTransactions(defaultUser.transactions);
    // console.log(ourUserTransactions);

    const closest = findClosest(ourUserTransactions);
    console.log('closest', closest);

    const bestCategory = getUserWeightedCategory(closest);
    console.log('bestCategory', bestCategory);

    const ourUserProducts = getUserProductsInCategory(ourUserTransactions, bestCategory);
    const closestUserProducts = getUserProductsInCategory(closest, bestCategory);
    console.log('ourUserProducts', ourUserProducts);
    console.log('closestUserProducts', closestUserProducts);

    const productForUser = getProductForUser(ourUserProducts, closestUserProducts);
    console.log('productForUser', productForUser);

    predictions.push(productForUser);
}

function findClosest(userTransactions) {
    const userCategories = getUniqueCategories(userTransactions);
    const userMeanBill = countMeanBill(userTransactions);

    const weights = users.map(function (user) {
        const cat = getUniqueCategories(getLastTransactions(user.transactions));
        const bill = countMeanBill(getLastTransactions(user.transactions));

        // console.log('cat: ', cat, 'bill: ', bill);
        // console.log('>>>>>>>>>BILL: ', bill);

        const catWeight = countUserCategoryWeight(userCategories, cat);
        const billWeight = countBillWeight(userMeanBill, bill);

        // console.log('catWeight: ', catWeight, 'billWeight: ', billWeight);

        return countUserWeight(catWeight, billWeight);
    });

    // console.log('weights: ', weights);

    return getLastTransactions(users[rwcOnWeights(weights)].transactions);
}

function getLastTransactions(userTransactions){
    return userTransactions.slice(userTransactions.length - 20, userTransactions.length);
}

function getUniqueCategories(userTransactions) {
    const ans = {};

    // console.log(userTransactions);

    userTransactions.forEach(function (trans) {
        trans.products.forEach(function (prod) {
            ans[prod.category] = ans[prod.category] ? ans[prod.category] + 1 : 1;
        });
    });

    return ans;
}

function countUserCategoryWeight(categories1, categories2) {
    // console.log('>>>>>>>>>>>>>', categories1, categories2);
    const ans = {};

    Object.keys(categories1).forEach(function (cat) {
        // console.log('>>>>>>>>cat: ', cat);
        if (categories2[cat]) {
            ans[cat] = categories1[cat] * 0.62 + categories2[cat] * 0.38;
        }
    });

    return ans;
}

function countMeanBill(userTransactions) {
    // console.log('countMeanBill', JSON.stringify(userTransactions));
    return (userTransactions.map(function (trans) {
        return trans.products
            .map(function (prod) { return prod.price })
            .reduce(function (sum, cur) { return sum + parseFloat(cur) }, 0);
    }).reduce(function (sum, cur) {
        return sum + parseFloat(cur);
    }, 0) / userTransactions.length);
}

function countBillWeight(bill1, bill2) {
    return parseFloat(bill1) - (Math.abs(parseFloat(bill1) - parseFloat(bill2)));
}

function countUserWeight(categoryWeight, billWeight) {
    const catWeight = Object.keys(categoryWeight).reduce(function (sum, cur) {
        return sum + parseFloat(categoryWeight[cur]);
    }, 0);
    return 0.62 * catWeight + 0.38 * billWeight;
}

function rwcOnWeights(weights) {
    const table = weights.map(function (weight, ind) { return { id: ind, weight: weight }});

    return rwc(table);
}

function getUserWeightedCategory(user) {
    const categories = getUniqueCategories(user);

    const weights = Object.keys(categories).map(function(cat) { return categories[cat] });

    const ourIndex = rwcOnWeights(weights);

    // danger ahtung!!!
    return Object.keys(categories)[ourIndex];
}

function getUserProductsInCategory(userTransactions, category) {
    const userProducts = [];

    userTransactions.forEach(function (trans) {
        trans.products.forEach(function (prod) {
            if (prod.category === category) {
                userProducts.push(prod);
            }
        });
    });

    return userProducts;
}

function getProductForUser(products1, products2) {
    for (var i = 0; i < products1.length; i++) {
        for (var j = 0; j < products2.length; j++) {
            if (products1[i].product !== products2[j].product) {
                return products2[j];
            }
        }
    }

    return products2[Math.floor(Math.random() * products2.length)];
}
