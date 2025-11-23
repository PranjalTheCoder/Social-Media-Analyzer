import { createRequire } from "module";

// We use 'createRequire' here because 'pdf-parse' is an older library
// that uses CommonJS (require) and doesn't fully support modern ES Modules (import) yet.
// This allows us to keep the rest of our project modern while supporting this dependency.
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export class PdfService {
  /**
   * Extracts raw text from a PDF file buffer.
   * @param buffer - The file buffer from the uploaded PDF.
   * @returns A clean string containing the PDF's text.
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      // The library version 1.1.1 exports a function we can call directly
      const data = await pdfParse(buffer);

      // Raw PDF text often has weird spacing or excessive newlines.
      // We clean it up to make it easier for the AI to analyze.
      const cleanedText = data.text
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/\n\s*\n/g, "\n") // Collapse multiple empty lines into one
        .trim();

      // Validation: If the PDF was just images or empty pages, this might be empty
      if (!cleanedText || cleanedText.length === 0) {
        throw new Error(
          "The PDF appears to be empty or contains no readable text."
        );
      }

      return cleanedText;
    } catch (error: any) {
      // Log the technical error for the developer
      console.error("PDF Service Error:", error);

      // Throw a friendly error for the user/frontend
      const msg =
        error instanceof Error ? error.message : "Unknown parsing error";
      throw new Error(`Failed to read PDF: ${msg}`);
    }
  }
}

// Export a singleton instance for easy use in routes
export const pdfService = new PdfService();
