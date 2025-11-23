import mongoose from "mongoose";

/**
 * Analysis Model
 * * This schema defines the structure for storing social media content analysis.
 * It acts as the single source of truth for our history feature in MongoDB.
 */
const analysisSchema = new mongoose.Schema({
  // Metadata: Helps users identify their original file in the history list
  fileName: { 
    type: String, 
    required: true 
  },
  
  // We track 'pdf' vs 'image' to render the correct icon in the UI
  fileType: { 
    type: String, 
    required: true 
  }, 

  // The Core Data: Raw text extracted via PDF-Parse (for docs) or Tesseract OCR (for images)
  extractedText: { 
    type: String, 
    required: true 
  },

  // AI Insights:
  // We make this optional so the database save SUCCEEDS even if the external AI API 
  // (Gemini) fails or times out. This ensures the user never loses their extracted text.
  suggestions: { 
    type: String, 
    required: false 
  },

  // Sentiment Analysis:
  // We strictly define defaults (Neutral/5) so the UI always has data to display,
  // even if the AI skips this step.
  sentiment: {
    score: { type: Number, default: 5 },
    label: { type: String, default: "neutral" },
  },

  // Calculated metric for quick stats in the dashboard
  wordCount: { 
    type: Number, 
    default: 0 
  },

  // Automatically track when this analysis was performed for sorting
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Export the model for use in our API routes
export const Analysis = mongoose.model("Analysis", analysisSchema);