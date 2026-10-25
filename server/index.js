require("dotenv").config();

console.log("SERVER STARTING...");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

console.log("Loading routes...");
const authRoute = require("./Routes/AuthRoute.js");
const predictionRoute = require("./Routes/PredictionRoute.js");
const datasetRoute = require("./Routes/DatasetRoute.js");

console.log("Routes loaded successfully.");

const app = express();

const { MONGO_URL, CLIENT_URL } = process.env;
const PORT = process.env.PORT || 4000;

// -------------------- CORS CONFIGURATION --------------------

const configuredOrigins = (CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const allowedOrigins = Array.from(
  new Set([...configuredOrigins, ...defaultOrigins])
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman, mobile requests without origin
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, "");
    if (
      allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.includes("*") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS error: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-ml-service-key",
  ],
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200,
};

// -------------------- MIDDLEWARE --------------------

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// -------------------- ROUTES --------------------

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DemandForecast backend server is running.",
  });
});

app.use("/", authRoute);
app.use("/", predictionRoute);
app.use("/", datasetRoute);

// -------------------- 404 --------------------

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// -------------------- ERROR HANDLER --------------------

app.use((err, req, res, next) => {
  console.error(err);

  if (err && err.message && err.message.startsWith("CORS error")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error.",
  });
});

// -------------------- DATABASE --------------------

console.log("Testing MongoDB connection...");

mongoose
  .connect(MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });
