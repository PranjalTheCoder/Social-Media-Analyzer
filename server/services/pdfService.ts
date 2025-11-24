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

      // FIX: Formatting Preservation
      // We removed the aggressive regex that stripped newlines.
      // Now we only trim the edges, allowing the AI to see paragraphs.
      const cleanedText = data.text.trim();

      if (!cleanedText) {
        throw new Error("No text content found in PDF");
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
