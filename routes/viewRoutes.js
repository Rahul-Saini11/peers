const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.isLoggedIn, viewController.getIndexPage);
router.get("/login", viewController.getLoginPage);
router.get("/signup", viewController.getSignupPage);

router.get("/space", authController.protect, viewController.getSpacePage);

module.exports = router;
