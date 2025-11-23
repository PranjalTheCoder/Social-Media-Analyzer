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

// 2. Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Allow Frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
