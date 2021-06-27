const router = require("express").Router();
const passport = require("passport");

// Controller middlewear
const userManagementController = require("../controllers/user-management-api");

/** User signup */
router.post("/signup", userManagementController.userSignUp);

/** User login */
router.post("/login", passport.authenticate("local"), (req, res) => {res.status(200).send("Logged in");});

/** User change password */
router.put("/change-password", userManagementController.changePassword);

/** User update profile */
router.put("/update-profile", userManagementController.updateProfile);

/** Delete user */
router.delete("/delete-user", userManagementController.deleteUser);

/** Get list of all users */
router.get("/get-all-users", userManagementController.getAllUsers);

/** Get user */
router.get("/get-user/:username", userManagementController.getUser);

module.exports = router;
