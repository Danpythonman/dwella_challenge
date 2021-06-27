const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

// Get database URI from separate file
const URI = JSON.parse(fs.readFileSync("./database-access-info.json"))["URI"];
// Get database name and collection name from separate file
const dataBaseName = JSON.parse(fs.readFileSync("./database-access-info.json"))["dataBaseName"];
const collectionName = JSON.parse(fs.readFileSync("./database-access-info.json"))["collectionName"];

authenticateUser = (passport) => {
    passport.use(new LocalStrategy((username, password, done) => {
        // Connect to database
        const mongoClient = new MongoClient(URI,
            { useNewUrlParser: true, useUnifiedTopology: true });

        mongoClient.connect(async (err, db) => {
            const collection = mongoClient.db(dataBaseName).collection(collectionName);
            try {
                let requestedUser = await collection.findOne({ username: username });
                if (!requestedUser) {
                    requestedUser = await collection.findOne({ email: username });
                }
                if (!requestedUser) {
                    mongoClient.close();
                    return done(null, false, { message: "No user with specified username or email" });
                }

                if (await bcrypt.compare(password, requestedUser.password)) {
                    mongoClient.close();
                    return done(null, requestedUser);
                }
                else {
                    mongoClient.close();
                    return done(null, false, { message: "Incorrect password" });
                }
            } catch (e) {
                mongoClient.close();
                return done(e);
            }
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => {
        // Connect to database
        const mongoClient = new MongoClient(URI,
            { useNewUrlParser: true, useUnifiedTopology: true });

        mongoClient.connect(async (err, db) => {
            const collection = mongoClient.db(dataBaseName).collection(collectionName);
            try {
                let requestedUser = await collection.findOne({ _id: new ObjectId(id) });
                done(null, requestedUser);
            } catch (e) {
                mongoClient.close();
                return done(e);
            }
        });
    });
}

module.exports = authenticateUser;
