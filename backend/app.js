require("./config/db").connect();
require("express-async-errors");
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

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
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

app.post("/login", cors(corsOptions), async (req, res) => {
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

app.post("/resetPwLoggedIn", cors(corsOptions), auth, async (req, res) => {
   const email = req.user.email;
   console.log(email);

   // Create token
   const token = jwt.sign(
        { user_id: req.user._id, email },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    );
    const link = `http://localhost:4001/resetPwLink?token=${token}`;

    sendEmail(email, link);
});

app.post("/resetPwNotLoggedIn", cors(corsOptions), async (req, res) => {
    const { email } = req.body;
    if (!(email)) {
        res.status(400).send("Email is required");
      }

    const user = await User.findOne({ email });

    if (!user) {
        res.send('User does not exist!');
        return
    }

    // Create token
    const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
            expiresIn: "5h",
        }
    );
    console.log(token);

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
        console.log(token);
        jwt.verify(token, process.env.TOKEN_KEY);
    } catch (err) {
        console.error(err)
        return res.status(401).send("Invalid Token");
    };

    // use pugexpress to generate html form
    res.render('index', { title: 'Reset Password', message: 'Please reset your password here:', token: token })
});

app.post("/updatePW", cors(corsOptions), async (req, res) => {
    const token = req.body.token;
    console.log('called updatePW');
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const email = decoded.email;
        console.log('token verified');

        // get new pw from frontend
        const newPassword = req.body.pw;
        const confirmPw = req.body.confirmPw;
        console.log(newPassword);
        if (newPassword != confirmPw) {
            return res.status(409).send("Passwords don't match");
        }

        // hash pw
        const encryptedPassword = await bcrypt.hash(newPassword, 12);

        // update pw in db
        const result = await User.updateMany({email: email}, {password: encryptedPassword, lastUpdated: {"password": new Date().toISOString()}}, { upsert: true });
        console.log(result);
        res.send("password updated");
    } catch (err) {
        console.error(err);
        return res.status(401).send("something went wrong");
    };
});

app.post("/welcome", cors(corsOptions), auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

app.get("/bars", cors(corsOptions), auth, async (req, res) => {
    const result = await Place.find({category: "Best Bars"}).sort({rating: -1});
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
