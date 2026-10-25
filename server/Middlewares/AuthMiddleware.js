const User = require("../Models/UserModel.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const getToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

module.exports.userVerification = async (req, res) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not found.",
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      username: user.username,
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error("Authentication Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports.authenticateUser = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token not found.",
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await User.findById(decoded.id).select(
      "_id email username"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error("Authentication Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
