require("./config/db").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("./model/user");
const Place = require("./model/berlinPlaces");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json());

// Register
app.post("/register", async (req, res) => {
    // Our register logic starts here
    try {
        // Get user input
        const { username, email, password } = req.body;


        // Validate user input
        if (!(username && email && password)) {
            res.status(400).send("All input is required");
            return
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email: email.toLowerCase() });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 12);

        // Create user in our database
        const user = await User.create({
            email: email.toLowerCase(), // sanitize: convert email to lowercase,
            username,
            password: encryptedPassword,
            createdAt: new Date().toISOString(),
        });

        // Create token
        const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
        };
});

// Login
app.post("/login", async (req, res) => {
 // Our login logic starts here
 try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(user);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.get("/bars", async (req, res, next) => {
    const query = {category: "Best Bars"};
    const sorting = {rating: -1};
    const result = await Place.find(query).sort(sorting);
    console.log(result);
    res.json(result);
});

app.get("/restaurants", async (req, res, next) => {
    const query = {category: "Best Restaurants"};
    const sorting = {rating: -1};
    const result = await Place.find(query).sort(sorting);
    res.json(result);
});

app.get("/brunch", async (req, res, next) => {
    const query = {category: "Brunch"};
    const sorting = {rating: -1};
    const result = await Place.find(query).sort(sorting);
    res.json(result);
});

module.exports = app;
