// query user with password and email
// send user details (profile)

const db = require('./db');

var express = require("express");
var app = express();

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

app.get("/bars", async (req, res, next) => {
    const query = {category: "Best Bars"};
    const sorting = {rating: -1};
    const result = await db(query, sorting);
    res.json(result);
});

app.get("/restaurants", async (req, res, next) => {
    const query = {category: "Best Restaurants"};
    const sorting = {rating: -1};
    const result = await db(query, sorting);
    res.json(result);
});

app.get("/brunch", async (req, res, next) => {
    const query = {category: "Brunch"};
    const sorting = {rating: -1};
    const result = await db(query, sorting);
    res.json(result);
});

