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

const app = express();

// Put the body of POST requests in the request variable instead of the URL
app.use(express.urlencoded({extended: false}));

/* * * * * * * * * * * * * * * User Management * * * * * * * * * * * * * * */

/** User Signup */
app.post("/signup", (req, res) => {});

/** User login */
app.post("/login", (req, res) => {});

/** User change password */
app.post("/change-password", (req, res) => {});

/** User update profile */
app.post("/update-profile", (req, res) => {});

/** Delete user */
app.delete("/delete-user", (req, res) => {});

/** Get list of all users */
app.get("/get-all-users", (req, res) => {});

/** Get user */
app.get("/get-user", (req, res) => {});

const PORT = 5000;

app.listen(PORT, () => {console.log(`Listening on port ${PORT}.....`)});
