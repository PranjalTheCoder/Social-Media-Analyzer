import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";

// 1. Load Environment Variables
dotenv.config();

const app = express();
// const PORT = process.env.PORT || 5000;
const PORT = parseInt(process.env.PORT || "5000", 10);

// Allow specific origins (Localhost + Your Production Frontend)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL || "", // We will set this variable in Render later
];

// 2. Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // For simplicity during development/testing, you might want to allow all:
        // return callback(null, true);
        // But for security, stick to the allowed list:
        return callback(
          new Error(
            "The CORS policy for this site does not allow access from the specified Origin."
          ),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("✅ Social Media Analyzer API is healthy and running!");
});

// 3. Connect to MongoDB
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/content_analyzer";


mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 4. Register Routes
registerRoutes(app);

// 5. Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
