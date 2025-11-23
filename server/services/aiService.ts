import { GoogleGenAI } from "@google/genai";

/**
 * AI Service
 * Handles all interactions with the Google Gemini API.
 * * This service is responsible for:
 * 1. Analyzing text content to provide engagement suggestions.
 * 2. Performing sentiment analysis on the text.
 * * We use a Singleton pattern so we don't keep re-initializing the API client.
 */
export class AiService {
  
  /**
   * Lazy-loads the Gemini API Client.
   * * We do this inside a method rather than at the top level so the server
   * doesn't crash immediately if the .env file hasn't loaded yet.
   * It checks for the key only when we actually try to use the AI.
   */
  private getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env file");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Generates social media engagement tips based on the uploaded text.
   * @param text - The raw text extracted from the PDF or Image.
   * @returns A markdown-formatted string containing advice.
   */
  async generateSuggestions(text: string): Promise<string> {
    try {
      const ai = this.getClient();

      // We structure the prompt with a clear "Role" and "Task" to get better results.
      const prompt = `You are a social media content expert. Analyze the following social media post content and provide detailed suggestions to improve engagement.

Content to analyze:
"""
${text}
"""

Please provide suggestions in the following categories:
1. **Caption Improvements**: How to make the caption more engaging and compelling
2. **Hook Optimization**: Suggestions for attention-grabbing opening lines
3. **Hashtag Strategy**: Relevant and trending hashtags to increase reach
4. **Tone & Voice**: Recommendations for tone adjustments to better connect with the audience
5. **Call-to-Action**: Suggestions for encouraging user interaction

Format your response in a clear, organized manner with specific, actionable recommendations.`;

      // We use 'gemini-2.0-flash' because it's fast and cost-effective for text tasks
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const suggestions = response.text || "Unable to generate suggestions at this time.";
      return suggestions;

    } catch (error) {
      console.error("AI Suggestions Error:", error);
      
      // Provide a clear error message to the backend logs
      if (error instanceof Error) {
        throw new Error(`AI suggestion generation failed: ${error.message}`);
      }
      throw new Error("AI suggestion generation failed: Unknown error");
    }
  }

  /**
   * Analyzes the sentiment of the text.
   * Returns a simple score (1-10) and a label (positive/neutral/negative).
   * * Note: We force the AI to return JSON so we can parse it easily in the frontend.
   */
  async analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
    try {
      const ai = this.getClient();

      const prompt = `Analyze the sentiment of the following text and provide a score from 1 to 10 (where 1 is very negative, 5 is neutral, and 10 is very positive) and a label (positive, neutral, or negative).

Text to analyze:
"""
${text}
"""

Respond with ONLY a JSON object in this exact format (no other text, no markdown):
{"score": number, "label": "positive" | "neutral" | "negative"}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const rawJson = response.text?.trim();
      
      if (rawJson) {
        // Gemini often wraps JSON in markdown code blocks (```json ... ```).
        // This regex extracts just the JSON object found between curly braces.
        const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          return {
            // Ensure score stays within 1-10 bounds just in case AI hallucinates
            score: typeof data.score === 'number' ? Math.max(1, Math.min(10, data.score)) : 5,
            label: ['positive', 'neutral', 'negative'].includes(data.label) ? data.label : 'neutral'
          };
        }
      }
      
      // Fallback: If AI returns weird data, default to Neutral (5)
      return { score: 5, label: "neutral" };

    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      // Fail gracefully: Return neutral sentiment so the UI doesn't break
      return { score: 5, label: "neutral" };
    }
  }
}

// Export a single instance for the entire app to use
export const aiService = new AiService();