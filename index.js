// setting up app server - express
// connection to db collection - mongodb
// query list from db
// send list to frontend
// query user with password and email
// send user details (profile)

var express = require("express");
var app = express();

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

app.get("/url", (req, res, next) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
   });


