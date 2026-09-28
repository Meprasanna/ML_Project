const express = require("express");

const {
  authenticateUser,
} = require("../Middlewares/AuthMiddleware.js");

const {
  predictDemand,
} = require("../Controllers/PredictionController.js");

const router = express.Router();

router.post(
  "/predict",
  authenticateUser,
  predictDemand
);

module.exports = router;
