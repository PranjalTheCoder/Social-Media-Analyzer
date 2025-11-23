import type { Express } from "express";
import multer from "multer";
import { Analysis } from "./models/Analysis";
import { pdfService } from "./services/pdfService";
import { ocrService } from "./services/ocrService";
import { aiService } from "./services/aiService";

/**
 * API Routes Configuration
 * * This file defines all the endpoints for our backend server.
 * * It handles file uploads, data processing pipelines, and database interactions.
 */

// 1. Configure Multer for File Uploads
// We use memory storage so we can process files immediately in RAM
// without filling up the server's disk space with temporary files.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit files to 10MB to prevent DoS
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

export function registerRoutes(app: Express) {

  // --- A. SINGLE FILE UPLOAD & ANALYSIS ---
  // This is the main endpoint used when a user drags a single file onto the dashboard.
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      let extractedText = "";
      let fileType = "";

      // Step 1: Extract Text based on file type (Strategy Pattern)
      if (file.mimetype === "application/pdf") {
        fileType = "pdf";
        extractedText = await pdfService.extractText(file.buffer);
      } else {
        fileType = "image";
        extractedText = await ocrService.extractText(file.buffer);
      }

      // Step 2: AI Analysis (Fault Tolerant)
      // We wrap this in its own try-catch so that if the AI service (Gemini) is down
      // or rate-limited, we STILL save the file and text to the database.
      // The user gets a result, just without the "smart" suggestions.
      let suggestions = "AI analysis unavailable at this time.";
      let sentiment = { score: 5, label: "neutral" };

      try {
        // Run suggestions and sentiment analysis in parallel to save time
        [suggestions, sentiment] = await Promise.all([
          aiService.generateSuggestions(extractedText),
          aiService.analyzeSentiment(extractedText),
        ]);
      } catch (aiError) {
        console.warn("AI Service failed silently:", aiError);
        // We continue execution...
      }

      // Calculate basic metrics locally
      const wordCount = extractedText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      // Step 3: Persistence
      // Save the complete analysis record to MongoDB
      const newAnalysis = new Analysis({
        fileName: file.originalname,
        fileType,
        extractedText: extractedText || "No readable text found.",
        suggestions,
        sentiment,
        wordCount,
      });

      await newAnalysis.save();

      // Step 4: Response
      // Return the full object so the UI can display it immediately
      res.json({
        ...newAnalysis.toObject(),
        metadata: {
          fileType,
          fileName: file.originalname,
          wordCount,
        },
      });

    } catch (error: any) {
      console.error("Single Upload Error:", error);
      // Return a clean error message to the client
      res.status(500).json({ message: error.message || "An error occurred during processing." });
    }
  });

  // --- B. BATCH UPLOAD PROCESSING ---
  // Handles multiple files at once. Useful for bulk content audits.
  app.post("/api/upload/batch", upload.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const results = [];

      // We process files sequentially or in parallel loops.
      // Here we simply iterate to handle each one individually.
      for (const file of files) {
        try {
          // 1. Extraction
          let extractedText = "";
          let fileType = "";

          if (file.mimetype === "application/pdf") {
            fileType = "pdf";
            extractedText = await pdfService.extractText(file.buffer);
          } else {
            fileType = "image";
            extractedText = await ocrService.extractText(file.buffer);
          }

          // 2. AI Analysis
          // We skip AI for very short texts to save API quota
          let suggestions = "Batch processing completed.";
          let sentiment = { score: 5, label: "neutral" };

          if (extractedText.length > 10) {
            try {
              [suggestions, sentiment] = await Promise.all([
                aiService.generateSuggestions(extractedText),
                aiService.analyzeSentiment(extractedText),
              ]);
            } catch (e) {
              console.log(`Skipping AI for ${file.originalname} due to error.`);
            }
          }

          // 3. Save to DB
          const newAnalysis = new Analysis({
            fileName: file.originalname,
            fileType,
            extractedText: extractedText || " ",
            suggestions,
            sentiment,
            wordCount: extractedText.split(/\s+/).length,
          });

          await newAnalysis.save();

          // Success Result
          results.push({
            fileName: file.originalname,
            success: true,
            extractedText,
            suggestions,
            sentiment,
            metadata: { fileType, fileName: file.originalname, wordCount: newAnalysis.wordCount },
          });

        } catch (error) {
          console.error(`Failed to process file ${file.originalname}:`, error);
          // Return a failure object for this specific file so others still succeed
          results.push({
            fileName: file.originalname,
            success: false,
            error: "Processing failed for this file.",
          });
        }
      }

      // Return summary stats to the frontend
      res.json({
        results,
        total: files.length,
        successful: results.filter((r) => r.success).length,
      });

    } catch (error: any) {
      console.error("Batch Upload Critical Error:", error);
      res.status(500).json({ message: "Batch upload process failed completely." });
    }
  });

  // --- C. HISTORY ENDPOINT ---
  // Fetches past analyses, sorted by newest first.
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      const history = await Analysis.find()
        .sort({ createdAt: -1 }) // Newest first
        .limit(limit);
        
      res.json(history);
    } catch (error) {
      console.error("History Fetch Error:", error);
      res.status(500).json({ message: "Failed to load history." });
    }
  });

  // --- D. SINGLE ANALYSIS DETAILS ---
  // Used when clicking an item in the history sidebar
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const analysis = await Analysis.findById(req.params.id);
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      // Likely an invalid ID format
      res.status(500).json({ message: "Error fetching specific analysis." });
    }
  });
}