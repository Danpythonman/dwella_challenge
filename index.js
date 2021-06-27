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

const app = express();

// Put the body of POST requests in the request variable instead of the URL
app.use(express.urlencoded({extended: false}));

app.use(routes);

app.get("/", (req, res) => {
    res.sendFile("index.html", {root: __dirname});
});

const PORT = 5000;

app.listen(PORT, () => {console.log(`Listening on port ${PORT}.....`)});
