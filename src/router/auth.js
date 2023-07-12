const express = require("express");
const router = express.Router();

import * as controllers from "../controllers";

router.post("/register", controllers.register);
router.post("/login", controllers.login);
router.post("/refresh-token", controllers.refreshTokenController);

module.exports = router;
