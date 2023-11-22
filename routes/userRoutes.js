const router = require("express").Router();
const authContoller = require("../controllers/authController");

router.post("/signup", authContoller.signup);
router.post("/login", authContoller.login);

router.get("/logout", authContoller.logout);

router.get("/space", authContoller.protect, authContoller.space);

module.exports = router;
