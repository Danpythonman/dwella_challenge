const fs = require("fs");
const Joi = require("joi");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const passport = require("passport");
// const passport = require("passport");

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

changePassword = async (req, res) => {
    if (!req.user) {
        res.status(401).send("Must be logged in");
        return;
    }
    try {
        if (await bcrypt.compare(req.body.oldPassword, req.user.password)) {
            // Connect to database
            const mongoClient = new MongoClient(URI,
                { useNewUrlParser: true, useUnifiedTopology: true });

            mongoClient.connect(async (err, db) => {
                const collection = mongoClient.db(dataBaseName).collection(collectionName);
                console.log(req.user._id);
                const userQuery = {_id: new ObjectId(req.user._id)}

                try {
                    const userNewPassword = await bcrypt.hash(req.body.newPassword, 10);
                    const userPasswordUpdate = { $set: {password: userNewPassword}};
                    collection.updateOne(userQuery, userPasswordUpdate, (err, result) => {
                        if (err) {throw err;}
                        console.log("User password updated");
                        res.status(200).send("Password updated");
                        mongoClient.close();
                    });
                } catch (e) {
                    console.log(e);
                    res.status(500).send("Error with hashing password");
                }

            });
        }
        else {
            res.status(400).send("Current password incorrect");
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Error with hashing password");
    }
}

updateProfile = (req, res) => {
    if (!req.user) {
        res.status(401).send("Must be logged in");
        return;
    }

    if (req.body.selectedProperty == "full_name") {
        var userUpdate = { $set: {full_name: req.body.updatedProperty}};
    }
    else if (req.body.selectedProperty == "phone_number") {
        var userUpdate = { $set: {phone_number: req.body.updatedProperty}};
    }
    else if (req.body.selectedProperty == "address") {
        var userUpdate = { $set: {address: req.body.updatedProperty}};
    }
    else {
        res.status(400).send("selectedProperty must be 'full_name', 'phone_number', or 'address'");
        return;
    }

    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    mongoClient.connect(async (err, db) => {
        const collection = mongoClient.db(dataBaseName).collection(collectionName);
        const userQuery = {_id: new ObjectId(req.user._id)};

        collection.updateOne(userQuery, userUpdate, (err, result) => {
            if (err) {throw err;}
            console.log("User updated");
            res.status(200).send("User updated");
            mongoClient.close();
        });
    });
}

deleteUser = (req, res) => {
    if (!req.user) {
        res.status(401).send("Must be logged in");
        return;
    }

    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });

    mongoClient.connect(async (err, db) => {
        const collection = mongoClient.db(dataBaseName).collection(collectionName);
        const userQuery = {username: req.user.username};

        collection.deleteOne(userQuery, (err, result) => {
            if (err) {throw err;}
            console.log("User deleted");
            res.status(200).send("User deleted");
            mongoClient.close();
        });
    });
}

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
            if (!queriedUser) {
                res.status(400).send(`No user object with username ${req.params.username}`);
            }
            else {
                res.send(queriedUser);
                console.log(`User object with username ${req.params.username} retrieved`);
            }
            mongoClient.close();
        } catch {
            res.status(500).send("Error with retrieving specified user");
        }
    });
}

module.exports = {userSignUp, userLogin, changePassword, updateProfile, deleteUser, getAllUsers, getUser};
