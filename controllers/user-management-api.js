const fs = require("fs");
const Joi = require("joi");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

// Get database URI from separate file
const URI = JSON.parse(fs.readFileSync("./database-access-info.json"))["URI"];
// Get database name and collection name from separate file
const dataBaseName = JSON.parse(fs.readFileSync("./database-access-info.json"))["dataBaseName"];
const collectionName = JSON.parse(fs.readFileSync("./database-access-info.json"))["collectionName"];

/************************ * * * * * Signup * * * * * *************************/

userSignUp = (req, res) => {
    // Create schema for input validation, then validate
    // This schema is what is expected from the client
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().email().required(),
        full_name: Joi.string().required(),
        address: Joi.string().required(),
        phone_number: Joi.number().required()
    });
    const validationResult = schema.validate(req.body);

    // If error, send error details
    if (validationResult.error) {
            const errorDetails = validationResult.error.details[0].message;
        res.status(400).send(errorDetails);
        return; // Stop here
    }

    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(async (err, db) => {
        // Encrypt password
        currentUserObject = req.body;
        currentUserObject["password"] = await bcrypt.hash(req.body.password, 10)
        .then(() => {
            // Insert object in the collection in the database
            const collection = mongoClient.db(dataBaseName)
            .collection(collectionName);

            collection.insertOne(req.body, async (err, res) => {
                if (err) {throw err;}
                console.log("New user added");
                mongoClient.close();
            });
            // Send the object back
            res.status(200).send(currentUserObject);
        }).catch(() => {
            res.status(500).send("Error with password hashing");
            console.log("Error with password hashing");
        });
    });
}

/************************* * * * * * Login * * * * * **************************/

// Login function not needed. It is handled by passport
userLogin = (req, res) => {}

/******************** * * * * * Change Password * * * * * *********************/

changePassword = async (req, res) => {
    /* Expects in request body:
     * oldPassword -> should match the current user's password
     * newPassword -> new password that will be saved
     */

    // Stop the function if there is no user logged in
    if (!req.user) {
        res.status(401).send("Must be logged in");
        return;
    }
    // Compare the old password with the current password in the user object
    await bcrypt.compare(req.body.oldPassword, req.user.password)
    .then((passwordsMatch) => {
        if (!passwordsMatch) {
            res.status(400).send("Current password incorrect");
            return;
        }

        // Connect to database
        const mongoClient = new MongoClient(URI,
            { useNewUrlParser: true, useUnifiedTopology: true });
        mongoClient.connect(async (err, db) => {
            const collection = mongoClient.db(dataBaseName).collection(collectionName);
            const userQuery = { _id: new ObjectId(req.user._id) }

            // Encrypt new password
            await bcrypt.hash(req.body.newPassword, 10)
            .then((userNewPassword) => {
                // Update object
                const userPasswordUpdate = { $set: {password: userNewPassword}};

                // Update password in database
                collection.updateOne(userQuery, userPasswordUpdate, (err, result) => {
                    if (err) {throw err;}
                    console.log("User password updated");
                    res.status(200).send("Password updated");
                    mongoClient.close();
                })
            })
            .catch((e) => {
                console.log(e);
                res.status(500).send("Error with hashing password");
            });
        });
    })
    .catch((e) => {
        console.log(e);
        res.status(500).send("Error with comparing passwords");
    });
}

/******************** * * * * * Update Profile * * * * * *********************/

updateProfile = (req, res) => {
    /* Expects in request body:
     * selectedProperty -> either 'full_name', 'phone_number', or 'address'
     * updatedProperty -> new value to put in the field specified in selectedProperty
     */

    // Stop the function if there is no user logged in
    if (!req.user) {
        res.status(401).send("Must be logged in");
        return;
    }

    // Form the update object according to the specified property to be updated
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

        // Update the user object in the database
        collection.updateOne(userQuery, userUpdate, (err, result) => {
            if (err) {throw err;}
            console.log("User updated");
            res.status(200).send("User updated");
            mongoClient.close();
        });
    });
}

/********************** * * * * * Delete user * * * * * ***********************/

deleteUser = (req, res) => {
    // Stop the function if there is no user logged in
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

        // Delete the user in the database
        collection.deleteOne(userQuery, (err, result) => {
            if (err) {throw err;}
            console.log("User deleted");
            res.status(200).send("User deleted");
            mongoClient.close();
        });
    });
}

/***************** * * * * * Get list of all users * * * * * ******************/

getAllUsers = (req, res) => {
    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect((err, db) => {
        const collection = mongoClient.db(dataBaseName)
            .collection(collectionName);

        // Get array of all users in the collection
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

/***************** * * * * * Get user by username * * * * * ******************/

// Missing functionality to get user by email
getUser = (req, res) => {
    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(async (err, db) => {
        const collection = mongoClient.db(dataBaseName)
            .collection(collectionName);

        // Get user from the database
        await collection.findOne({ username: req.params.username })
            .then((queriedUser) => {
            // Check if user actually exists in database
            if (!queriedUser) {
                res.status(400).send(`No user object with username ${req.params.username}`);
            }
            else {
                res.send(queriedUser);
                console.log(`User object with username ${req.params.username} retrieved`);
            }
            mongoClient.close();
        })
        .catch(() => {
            res.status(500).send("Error with retrieving specified user");
        });
    });
}

module.exports = {userSignUp, userLogin, changePassword, updateProfile, deleteUser, getAllUsers, getUser};
