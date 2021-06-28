const fs = require("fs");
const Joi = require("joi");
const { MongoClient, ObjectId } = require("mongodb");
const http = require("http");

// Get database URI from separate file
const URI = JSON.parse(fs.readFileSync("./database-access-info.json"))["URI"];
// Get database name and collection name from separate file
const dataBaseName = JSON.parse(fs.readFileSync("./database-access-info.json"))["dataBaseName"];
const collectionName = JSON.parse(fs.readFileSync("./database-access-info.json"))["listingsCollectionName"];

/******************** * * * * * Create listing * * * * * *********************/

createListing = async (req, res) => {
    // Check if client sent address
    // This check is done separately to ensure the geolocate API has an address to use
    if (!req.body.address) {
        res.status(400).send("Address required");
        return;
    }

    // Create schema for input validation, then validate
    // This schema is what is expected from the client
    const schema = Joi.object({
        title: Joi.string().required(),
        address: Joi.required(),  // Address was already verified, no need to specify type
        price: Joi.number(),      // Store price as number of dollars
        city: Joi.string().required(),
        owner: Joi.string().required(),
        type: Joi.string().valid("residential", "commercial", "industrial").required()
    });

    // Form URL for geolocate API from separate file
    let geolocateURL = JSON.parse(fs.readFileSync("./positionstack-key.json"))["base_URL"];
    geolocateURL += "forward?access_key=";
    geolocateURL += JSON.parse(fs.readFileSync("./positionstack-key.json"))["key"];
    geolocateURL += "&query=";
    geolocateURL += req.body.address;

    // Get the geolocation from the API
    http.get(geolocateURL, (re) => {
        let dataString = "";
        re.on("data", (data) => {
            dataString += data;
        });
        re.on("end", () => {
            // Get the recieved data in JSON format
            dataObject = JSON.parse(dataString);

            // Change the address to longitude and latitude
            req.body.address = {
                "latitude": dataObject.data[0].latitude,
                "longitude": dataObject.data[0].longitude
            };

            // Validate user input based on the schema
            const validationResult = schema.validate(req.body);
            // If error, send error details
            if (validationResult.error) {
                const errorDetails = validationResult.error.details[0].message;
                res.status(400).send(errorDetails);
                return; // Stop here
            }

            // Make the city upper case so that it is easier to search for cities
            req.body.city = req.body.city.toUpperCase();

            // Connect to database
            const mongoClient = new MongoClient(URI,
                { useNewUrlParser: true, useUnifiedTopology: true });
            mongoClient.connect(async (err, db) => {

                // Insert object in the collection in the database
                const collection = mongoClient.db(dataBaseName)
                    .collection(collectionName);
                collection.insertOne(req.body, async (err, res) => {
                    if (err) {
                        res.status(500).send("Error with adding listing to database");
                        throw err;
                    }
                    console.log("New listing added");
                    mongoClient.close();
                });
                // Send the object back
                res.status(200).send(req.body);
            });

        }).on("error", (err) => {
            console.log(err);
            res.status(500).send("Error with geolocating address");
            return;
        });
    });
}

/******************** * * * * * Update listing * * * * * *********************/

// To be completed
updateListing = (req, res) => {
    res.status(503).send("Endpoint not available");
}

/************* * * * * * Delete listing from market * * * * * **************/

// To be completed
deleteListingFromMarket = (req, res) => {
    res.status(503).send("Endpoint not available")
}

/************* * * * * * Delete listing from database * * * * * **************/

deleteListingFromDB = (req, res) => {
    // Check if the client provided an ID
    if (!req.body.id) {
        res.status(400).send("Provide an ID");
        return;
    }

    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(async (err, db) => {

        // Get collection
        const collection = mongoClient.db(dataBaseName).collection(collectionName);

        // Get listing from collection
        const listingQuery = {_id: new ObjectId(req.body.id)};

        // Delete the user in the database
        collection.deleteOne(listingQuery, (err, result) => {
            if (err) {
                res.status(500).send("Error with deleting listing");
                throw err;
            }
            console.log("Listing deleted");
            res.status(200).send("Listing deleted");
            mongoClient.close();
        });
    });
}

/******************* * * * * * Get all listings * * * * * ********************/

getAllListings = (req, res) => {
    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(async (err, db) => {

        // Get collection
        const collection = mongoClient.db(dataBaseName).collection(collectionName);

        collection.find({}).toArray((err, result) => {
            if (err) {
                res.status(500).send("Error with accessing listings from database");
                throw err;
            }
            res.status(200).send(result);
            console.log("All listings retrieved");
            mongoClient.close();
        });
    });
}

/***************** * * * * * Get listings by city * * * * * ******************/

getListingsByCity = (req, res) => {
    // Connect to database
    const mongoClient = new MongoClient(URI,
        { useNewUrlParser: true, useUnifiedTopology: true });
    mongoClient.connect(async (err, db) => {

        // Get collection
        const collection = mongoClient.db(dataBaseName).collection(collectionName);

        collection.find({city: req.params.city.toUpperCase()}).toArray((err, result) => {
            if (err) {
                res.status(500).send("Error with accessing listings from database");
                throw err;
            }
            res.status(200).send(result);
            console.log(`All listings in ${req.params.city} retrieved`);
            mongoClient.close();
        });
    });
}

/********* * * * * * Get listings by city and price range * * * * * **********/

getListingsByCityAndPrice = (req, res) => {}

module.exports = { createListing, updateListing, deleteListingFromMarket, deleteListingFromDB, getAllListings, getListingsByCity, getListingsByCityAndPrice };
