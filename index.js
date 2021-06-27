/*******************************************************************************
 *
 * index.js
 *
 * Created by: Daniel Di Giovanni
 *
 * Created on: June 26, 2021
 *
*******************************************************************************/

const express = require("express");
const routes = require("./routes/user-management-api");
const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const authenticateUser = require("./authenticateUser");
const flash = require("express-flash");
const session = require("express-session");

const app = express();

require("./authenticateUser")(passport);

// Put the body of POST requests in the request variable instead of the URL
app.use(express.urlencoded({extended: false}));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(routes);

app.get("/", (req, res) => {
    res.sendFile("index.html", {root: __dirname});
});

const PORT = 5000;

app.listen(PORT, () => {console.log(`Listening on port ${PORT}.....`)});
