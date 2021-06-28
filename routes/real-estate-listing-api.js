const router = require("express").Router();

// Controller middlewear
const realEstateController = require("../controllers/real-estate-listing-api");

router.post("/listing", realEstateController.createListing);

module.exports = router;
