const router = require("express").Router();

// Controller middlewear
const userManagementController = require("../controllers/user-management-api");

/** User Signup */
router.post("/signup", userManagementController.userSignUp);

/** User login */
router.post("/login", userManagementController.userLogin);

/** User change password */
router.post("/change-password", userManagementController.changePassword);

/** User update profile */
router.post("/update-profile", userManagementController.updateProfile);

/** Delete user */
router.delete("/delete-user", userManagementController.deleteUser);

/** Get list of all users */
router.get("/get-all-users", userManagementController.getAllUsers);

/** Get user */
router.get("/get-user/:username", userManagementController.getUser);

module.exports = router;
