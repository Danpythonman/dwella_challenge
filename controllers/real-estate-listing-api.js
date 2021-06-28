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

module.exports = { createListing };
