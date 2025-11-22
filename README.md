# Social Media Content Analyzer

## Overview

A web application that analyzes social media content from uploaded files (PDFs or images) and provides AI-powered suggestions to improve engagement. Users upload content files, the system extracts text using OCR or PDF parsing, sends it to Google's Gemini AI, and displays detailed recommendations for captions, hooks, hashtags, tone, and calls-to-action alongside the original extracted text.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing

**UI Component Strategy**
- Shadcn/ui component library for consistent, accessible UI components
- Radix UI primitives as the foundation for complex interactive components
- Tailwind CSS for utility-first styling
- Simple, clean design focusing on readability

**State Management**
- TanStack Query (React Query) for handling server data (fetching history, uploading files)
- Local component state for simple UI interactions (like file dragging)
- Custom hooks for reusable logic (e.g., `use-toast`)

**Design System**
- Custom color system using CSS variables for easy theming
- Responsive layout that works on mobile and desktop
- Clear visual feedback for loading states and errors

### Backend Architecture

**Server Framework**
- Express.js on Node.js for handling API requests
- ES Modules (import/export) enabled for modern JavaScript syntax
- Modular route system separating API logic from server setup

**Service Layer Pattern**
- **PDF Service**: Extracts text from PDF files using `pdf-parse` (custom adapter for compatibility)
- **OCR Service**: Extracts text from images (JPG/PNG) using `tesseract.js`
- **AI Service**: Generates engagement suggestions via Google Gemini API (lazily loaded for stability)

**File Upload Handling**
- Multer middleware for processing file uploads
- In-memory storage strategy (files are processed immediately, not saved to disk)
- Strict file type validation (PDF, JPEG, PNG only)

**API Design**
- RESTful endpoints (`/api/upload`, `/api/upload/batch`, `/api/history`)
- JSON response format containing extracted text and metadata
- robust error handling to ensure the server doesn't crash on bad files

### Data Storage

**Database**
- MongoDB as the NoSQL database (flexible document storage)
- Mongoose ODM for modeling application data

**Schema Design**
- `Analysis` collection stores upload history
  - `_id`: Unique MongoDB identifier
  - `fileName`: Name of the uploaded file
  - `fileType`: Type of file (pdf/image)
  - `extractedText`: The raw text pulled from the file
  - `suggestions`: AI-generated advice
  - `sentiment`: AI analysis of tone (score and label)
  - `wordCount`: Simple metric for content length
  - `createdAt`: Timestamp for sorting history

**Data Access Pattern**
- Direct Mongoose model calls (`Analysis.find()`, `Analysis.save()`)
- Asynchronous operations with try-catch blocks for safety

### External Dependencies

**AI Service Integration**
- Google Gemini API (via `@google/genai` SDK)
- Model: `gemini-2.0-flash` for fast content generation
- Prompts designed to ask for 5 specific categories:
  1. Caption improvements
  2. Hook optimization
  3. Hashtag strategy
  4. Tone and voice
  5. Call-to-action suggestions

**Text Extraction Services**
- **pdf-parse**: Used for reading text layers from PDF documents
- **tesseract.js**: Used for Optical Character Recognition (reading text from images)

**Database Service**
- Local MongoDB instance (developed on `127.0.0.1:27017`)
- Connection managed via `MONGODB_URI` environment variable

**Authentication**
- No user authentication is currently implemented (open access tool)