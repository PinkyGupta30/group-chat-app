const express = require("express");

const router = express.Router();

const chatController = require("../controllers/chatController");

// Save message
router.post("/messages", chatController.sendMessage);

// Get messages
router.get("/messages", chatController.getMessages);

module.exports = router;