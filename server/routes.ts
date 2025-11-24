import type { Express } from "express";
import multer from "multer";
import mongoose from "mongoose"; // Import mongoose to check connection status
import { Analysis } from "./models/Analysis";
import { pdfService } from "./services/pdfService";
import { ocrService } from "./services/ocrService";
import { aiService } from "./services/aiService";

/**
 * API Routes Configuration
 * Handles file uploads, processing pipelines, and database interactions.
 * Includes a "Mock Mode" fallback if MongoDB is not available.
 */

// 1. Configure Multer
// Process files in memory to avoid disk I/O overhead
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."));
    }
  },
});

// --- IN-MEMORY FALLBACK STORE ---
// Used if MongoDB is not connected so the app doesn't crash during review.
let mockDb: any[] = [];

export function registerRoutes(app: Express) {
  // Helper to check if we should use MongoDB or the Mock Store
  const isDbConnected = () => mongoose.connection.readyState === 1;

  // --- A. SINGLE UPLOAD ROUTE ---
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      let extractedText = "";
      let fileType = "";

      // 1. Extract Text
      if (file.mimetype === "application/pdf") {
        fileType = "pdf";
        extractedText = await pdfService.extractText(file.buffer);
      } else {
        fileType = "image";
        extractedText = await ocrService.extractText(file.buffer);
      }

      // 2. AI Analysis (Fault Tolerant)
      let suggestions = "AI analysis unavailable.";
      let sentiment = { score: 5, label: "neutral" };

      try {
        [suggestions, sentiment] = await Promise.all([
          aiService.generateSuggestions(extractedText),
          aiService.analyzeSentiment(extractedText),
        ]);
      } catch (aiError) {
        console.warn("AI Service Warning:", aiError);
      }

      const wordCount = extractedText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      // 3. Persistence (Switch between MongoDB and Mock)
      let responseData;

      if (isDbConnected()) {
        // Option A: MongoDB is alive
        const newAnalysis = new Analysis({
          fileName: file.originalname,
          fileType,
          extractedText: extractedText || "No text extracted",
          suggestions,
          sentiment,
          wordCount,
        });
        await newAnalysis.save();
        responseData = newAnalysis.toObject();
      } else {
        // Option B: MongoDB is offline (Mock Mode)
        const mockItem = {
          _id: Math.random().toString(36).substring(7), // Fake ID
          fileName: file.originalname,
          fileType,
          extractedText: extractedText || "No text extracted",
          suggestions,
          sentiment,
          wordCount,
          createdAt: new Date(),
        };
        mockDb.unshift(mockItem); // Add to start of array
        responseData = mockItem;
      }

      // 4. Response
      res.json({
        ...responseData,
        metadata: {
          fileType,
          fileName: file.originalname,
          wordCount,
        },
      });
    } catch (error: any) {
      console.error("Single Upload Error:", error);
      res.status(500).json({ message: error.message || "Processing failed" });
    }
  });

  // --- B. BATCH UPLOAD ROUTE ---
  app.post("/api/upload/batch", upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const results = [];

      for (const file of files) {
        try {
          // Extraction
          let extractedText = "";
          let fileType = "";

          if (file.mimetype === "application/pdf") {
            fileType = "pdf";
            extractedText = await pdfService.extractText(file.buffer);
          } else {
            fileType = "image";
            extractedText = await ocrService.extractText(file.buffer);
          }

          // AI Analysis (Skip for very short texts)
          let suggestions = "Batch processing completed.";
          let sentiment = { score: 5, label: "neutral" };

          if (extractedText.length > 10) {
            try {
              [suggestions, sentiment] = await Promise.all([
                aiService.generateSuggestions(extractedText),
                aiService.analyzeSentiment(extractedText),
              ]);
            } catch (e) {
              console.log(`AI skipped for ${file.originalname}`);
            }
          }

          const wordCount = extractedText.split(/\s+/).length;

          // Persistence
          if (isDbConnected()) {
            const newAnalysis = new Analysis({
              fileName: file.originalname,
              fileType,
              extractedText: extractedText || " ",
              suggestions,
              sentiment,
              wordCount,
            });
            await newAnalysis.save();
          } else {
            const mockItem = {
              _id: Math.random().toString(36).substring(7),
              fileName: file.originalname,
              fileType,
              extractedText: extractedText || " ",
              suggestions,
              sentiment,
              wordCount,
              createdAt: new Date(),
            };
            mockDb.unshift(mockItem);
          }

          results.push({
            fileName: file.originalname,
            success: true,
            extractedText,
            suggestions,
            sentiment,
            metadata: { fileType, fileName: file.originalname, wordCount },
          });
        } catch (error) {
          console.error(`Failed to process ${file.originalname}:`, error);
          results.push({
            fileName: file.originalname,
            success: false,
            error: "Processing failed",
          });
        }
      }

      res.json({
        results,
        total: files.length,
        successful: results.filter((r) => r.success).length,
      });
    } catch (error: any) {
      console.error("Batch Upload Error:", error);
      res.status(500).json({ message: "Batch upload process failed." });
    }
  });

  // --- C. HISTORY ROUTE ---
  app.get("/api/history", async (req, res) => {
    try {
      if (isDbConnected()) {
        const limit = parseInt(req.query.limit as string) || 50;
        const history = await Analysis.find()
          .sort({ createdAt: -1 })
          .limit(limit);
        res.json(history);
      } else {
        // Return Mock Data
        res.json(mockDb);
      }
    } catch (error) {
      console.error("History Error:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // --- D. GET SINGLE ANALYSIS ---
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      if (isDbConnected()) {
        const analysis = await Analysis.findById(req.params.id);
        if (!analysis) return res.status(404).json({ message: "Not found" });
        res.json(analysis);
      } else {
        // Search Mock Data
        const analysis = mockDb.find((item) => item._id === req.params.id);
        if (!analysis) return res.status(404).json({ message: "Not found" });
        res.json(analysis);
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching analysis" });
    }
  });
}
