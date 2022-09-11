const express = require("express");
const router = express.Router();

// Create New Card in List
router.post("/create");

// Move Card from List to List
router.post("/move");

// Get Single Card Info (including what List this card belongs to)
router.get("/:id");

// Edit Card Info (rename title, and edit card description)
router.post("/edit");

// Add File to Card
router.post("/file/attach");

// Remove File from Card
router.delete("/file/detach");

// Download File
router.post("/file/download");

// Add Comment
router.post("/comment/add");

// Remove Comment
router.delete("/comment/del");

// Change Card Cover
router.post("/cover");

// Add/Edit/Delete Labels on Card
router.post("/labels");

module.exports = router;
