const express = require("express");

const {
  authenticateUser,
} = require("../Middlewares/AuthMiddleware.js");

const {
  predictDemand,
  trainModel,
  getModelStatus,
} = require("../Controllers/PredictionController.js");

const router = express.Router();

router.post(
  "/predict",
  authenticateUser,
  predictDemand
);

router.post(
  "/models/train",
  authenticateUser,
  trainModel
);

router.get(
  "/models/status",
  authenticateUser,
  getModelStatus
);

module.exports = router;
