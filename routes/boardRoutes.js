const express = require("express");
const router = express.Router();

// List All Boards
router.get("/listall");

// Create New Board
router.post("/create");

// Get Single Board Info
router.get("/:id");

// Create New List in Board
router.post("/addlist");

// Add Member to Board
router.post("/member/add");

// Remove Member from Board (only if admin)
router.post("/member/del");

// Toggle Visibility of Board
router.post("/visibility");

// Edit Board Info (rename, add description, edit description)
router.post("/edit");

module.exports = router;
