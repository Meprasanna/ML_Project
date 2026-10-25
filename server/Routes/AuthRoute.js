const { Signup, Login, Logout } = require("../Controllers/AuthController.js");
const { userVerification } = require("../Middlewares/AuthMiddleware.js");
const router = require("express").Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/", userVerification);

module.exports = router;
