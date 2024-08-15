const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { signUp, login, getCurrentUser } = require('../controller/user')

// Route for user sign up
router.post("/signup", signUp);

// Route for user login
router.post("/login", login);

// Route to get authenticated user data
router.get("/user", authMiddleware, getCurrentUser);

module.exports = router;
