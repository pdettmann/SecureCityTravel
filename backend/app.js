require("./config/db").connect();
require("express-async-errors");
require('dotenv').config();

const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require("cors");

const User = require("./model/user");
const Place = require("./model/berlinPlaces");
const auth = require("./middleware/auth");
const sendEmail = require("./utils/sendEmail");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('view engine', 'pug');

const devEnv = process.env.DEVENV;
var corsOptions;

if (devEnv == "true") {
    corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
} else {
    corsOptions = {
        origin: 'url',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }
}

// Register
app.post("/register", cors(corsOptions), async (req, res) => {
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
        const oldUser = await User.findOne({ email: email.toString().toLowerCase() });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, 12);

        // Create user in our database
        const user = await User.create({
            email: email.toString().toLowerCase(), // sanitize: convert email to lowercase,
            username: username.toString(),
            password: encryptedPassword.toString(),
            createdAt: new Date().toISOString(),
            scope: "user"
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );

        user.token = token;

        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", cors(corsOptions), async (req, res) => {
 try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const user = await User.findOne({ email: email.toString().toLowerCase() });
    console.log(user);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email, scope: user.scope },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;

      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.post("/resetPwLoggedIn", cors(corsOptions), auth, async (req, res) => {
   const email = req.user.email;
   console.log(email);

   const token = jwt.sign(
        { user_id: req.user._id, email },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    );
    const link = `http://localhost:4001/resetPwLink?token=${token}`;

    sendEmail(email, link);
    console.log("email sent");
});

app.post("/resetPwNotLoggedIn", cors(corsOptions), async (req, res) => {
    const { email } = req.body;
    if (!(email)) {
        res.status(400).send("Email is required");
      }

    const user = await User.findOne({ email: email.toString() });

    if (!user) {
        res.send('User does not exist!');
        return
    }

    const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
            expiresIn: "5h",
        }
    );

    const link = `http://localhost:4001/resetPwLink?token=${token}`;
    sendEmail(email, link);
    res.send(link);
});

app.get("/resetPwLink", cors(corsOptions), (req, res) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    try {
        jwt.verify(token, process.env.TOKEN_KEY);
    } catch (err) {
        console.error(err)
        return res.status(401).send("Invalid Token");
    }

    res.render('index', { title: 'Reset Password', message: 'Please reset your password here:', token: token })
});

app.post("/updatePW", cors(corsOptions), async (req, res) => {
    const token = req.body.token;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const email = decoded.email;

        const newPassword = req.body.pw;
        const confirmPw = req.body.confirmPw;
        if (newPassword != confirmPw) {
            return res.status(409).send("Passwords don't match");
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 12);

        await User.updateMany({email: email.toString()}, {password: encryptedPassword.toString(), lastUpdated: {"password": new Date().toISOString()}}, { upsert: true });
        res.send("password updated");
    } catch (err) {
        console.error(err);
        return res.status(401).send("something went wrong");
    };
});

app.post("/updateList", cors(corsOptions), auth, async (req, res) => {
    const scope = req.user.scope;
    if (scope != "admin") {
        return res.status(401).send('Unauthorized request');
    }

    const nameOfDoc = req.body.nameOfDoc.toString();

    const placeUpdate = {
        "name": req.body.name,
        "content": req.body.content,
        "category": req.body.category,
        "link": req.body.link,
        "tally": req.body.tally,
        "bay_rating": req.body.bay_rating
    };

    const result = await Place.updateMany({name: nameOfDoc}, {
        name: placeUpdate.name.toString(),
        content: placeUpdate.content.toString(),
        category:placeUpdate.category.toString(),
        link: placeUpdate.link.toString(),
        tally: placeUpdate.tally.toString(),
        bay_rating:placeUpdate.bay_rating.toString()
    });

    res.send("updated");
    console.log(result);
});

app.get("/bars", cors(corsOptions), auth, async (req, res) => {
    const result = await Place.find({category: "Best Bars"});
    res.json(result);
});

app.get("/berlinPlaceName", cors(corsOptions), auth, async (req, res) => {
    const result = await Place.findOne({name: req.body.name.toString()});
    res.json(result);
});

app.get("/restaurants", cors(corsOptions), auth, async (req, res) => {
    const result = await Place.find({category: "Best Restaurants"}).sort({rating: -1});
    res.json(result);
});

app.get("/brunch", cors(corsOptions), auth, async (req, res) => {
    const result = await Place.find({category: "Brunch"}).sort({rating: -1});
    res.json(result);
});

module.exports = app;
