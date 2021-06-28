const router = require("express").Router();

// Controller middlewear
const realEstateController = require("../controllers/real-estate-listing-api");

/** Create listing */
router.post("/listing", realEstateController.createListing);

/** Update listing */
router.put("/listing", realEstateController.updateListing);

/** Delete listing from market */
router.delete("/listing-market", realEstateController.deleteListingFromMarket);

/** Delete listing from database */
router.delete("/listing", realEstateController.deleteListingFromDB);

/** Get all listings */
router.get("/listings", realEstateController.getAllListings);

/** Get listings by city */
router.get("/listings/:city", realEstateController.getListingsByCity);

/** Get listings by city and price range */
router.get("/listings/:city/:min/:max", realEstateController.getListingsByCityAndPrice);

module.exports = router;
