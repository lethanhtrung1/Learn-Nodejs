const express = require("express");
const router = express.Router();
const insertData = require("../controllers/insert");

router.get("/", insertData.insertData);

module.exports = router;
