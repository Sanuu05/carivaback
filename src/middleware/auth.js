const admin = require("../../firebase");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  const idToken = req.header("Authorization").replace("Bearer ", "");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.uid = decodedToken?.uid;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticate;
