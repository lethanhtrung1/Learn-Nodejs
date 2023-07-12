const express = require("express");
const router = express.Router();
const book = require("../controllers/book");

import verifyToken from "../middlewares/verify_token";
import { isAdmin, isCreatorOrAdmin } from "../middlewares/verify_roles";
import uploadCloud from "../middlewares/uploader";

// Public route
router.get("/", book.getBooks);

// Private route
router.use(verifyToken);
router.use(isCreatorOrAdmin);
router.post("/", uploadCloud.single("image"), book.createNewBook);
router.put("/", uploadCloud.single("image"), book.updateBook);
router.delete("/", book.deleteBook);

module.exports = router;
