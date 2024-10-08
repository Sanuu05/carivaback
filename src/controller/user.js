// src/controllers/userController.js
const User = require("../models/user");
const admin = require("../../firebase");

// SIGN UP
exports.signUp = async (req, res) => {
  try {
    const { name, email, password,confirmPassword } = req.body;
    if(!email || !password|| !confirmPassword || !password){
      return res.status(400).json({ message: "Missing required fields" });
    }
    if(password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Save user details in MongoDB
    const newUser = new User({
      uid: userRecord.uid,
      email,
      name,
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    console.error("Error during sign up:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const idToken = req.body.idToken;

  try {
    // Verify the ID token with Firebase Admin
    console.log({idToken})
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    // Fetch the user from MongoDB using the Firebase UID
    const user = await User.findOne({ uid });
    console.log({decodedToken,user})
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET CURRENT USER DATA
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
