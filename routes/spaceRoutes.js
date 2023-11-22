const router = require("express").Router();
const authContoller = require("../controllers/authController");
const spaceController = require("../controllers/spaceController");

router.get("/create-space", authContoller.protect, spaceController.createSpace);
router.post("/enter-space", authContoller.protect, spaceController.enterSpace);

module.exports = router;
