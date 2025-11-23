# Approach & Design

**Goal:** Automate social media analysis using AI to provide actionable engagement tips from PDF/Image uploads.

**Architecture (MERN Stack):**
I utilized a **Client-Server** architecture for scalability.

- **Frontend (React + Vite):** Chosen for performance. I used **Shadcn UI** for accessible, professional components and **TanStack Query** for robust data fetching and caching.
- **Backend (Express + TypeScript):** Implemented a **Service-Oriented Architecture** to isolate logic (AI, OCR, Parsing).
- **Database (MongoDB):** Selected for its flexibility in storing unstructured AI results.

**Key Technical Decisions:**

1.  **Robust Parsing:** implemented a strategy pattern using `pdf-parse` for documents and `tesseract.js` (OCR) for images to ensure reliable text extraction from any source.
2.  **Fault Tolerance:** The AI service is lazy-loaded and wrapped in error handlers. If the AI API fails, the system degrades gracefully, saving the raw text to history rather than crashing.
3.  **Batch Processing:** Created an asynchronous processing loop to handle multiple files sequentially, preventing server overload while providing real-time progress feedback.

**Challenges:**
Adapting legacy CommonJS libraries (`pdf-parse`) for a modern ES Module environment required implementing a custom `createRequire` adapter.
