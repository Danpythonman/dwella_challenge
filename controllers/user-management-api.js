const fs = require("fs");
const Joi = require("joi");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

// Get database URI from separate file
const URI = JSON.parse(fs.readFileSync("./database-access-info.json"))["URI"];
// Get database name and collection name from separate file
const dataBaseName = JSON.parse(fs.readFileSync("./database-access-info.json"))["dataBaseName"];
const collectionName = JSON.parse(fs.readFileSync("./database-access-info.json"))["collectionName"];

userSignUp = (req, res) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().email().required(),
        full_name: Joi.string().required(),
        address: Joi.string().required(),
        phone_number: Joi.number().required()
    });
    const validationResult = schema.validate(req.body);

    if (validationResult.error) {
        let errorDetails = "";
        for (let i = 0; i < validationResult.error.details.length; i++) {
            errorDetails += validationResult.error.details[i].message;
        }
        res.status(400).send(errorDetails);
        return; // Stop here
    }

    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    mongoClient.connect(async (err, db) => {
        try {
            currentUserObject = req.body;
            currentUserObject["password"] = await bcrypt.hash(req.body.password, 10);

            const collection = mongoClient.db(dataBaseName)
                .collection(collectionName);

            collection.insertOne(req.body, async (err, res) => {
                if (err) {throw err;}
                console.log("New user added");
                mongoClient.close();
            });

            res.status(200).send(currentUserObject);
        } catch {
            res.status(500).send("Error with password hashing");
            console.log("Error with password hashing");
        }
    });
}

userLogin = (req, res) => {}

changePassword = (req, res) => {}

updateProfile = (req, res) => {}

deleteUser = (req, res) => {}

getAllUsers = (req, res) => {
    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    mongoClient.connect((err, db) => {
        const collection = mongoClient.db(dataBaseName)
            .collection(collectionName);

        collection.find({}).toArray((err, result) => {
            if (err) {throw err;}
            for (let i = 0; i < result.length; i++) {
                delete result[i].password;
            }
            res.send(result);
            console.log("All user objects retrieved");
            mongoClient.close();
        });
    });
}

getUser = (req, res) => {
    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    mongoClient.connect(async (err, db) => {
        const collection = mongoClient.db(dataBaseName)
            .collection(collectionName);

        try {
            const queriedUser = await collection.findOne({ username: req.params.username });
            res.send(queriedUser);
            console.log(`User object with username ${req.params.username} retrieved`);
            mongoClient.close();
        } catch {
            res.status(500).send("Error with retrieving specified user");
        }
    });
}

module.exports = {userSignUp, userLogin, changePassword, updateProfile, deleteUser, getAllUsers, getUser};
