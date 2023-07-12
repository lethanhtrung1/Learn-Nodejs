const express = require("express");
const router = express.Router();

const user = require("../controllers/user");
import verifyToken from "../middlewares/verify_token";

// Public routes

// Private routes
router.use(verifyToken);
router.get("/", user.getCurrent);

module.exports = router;
