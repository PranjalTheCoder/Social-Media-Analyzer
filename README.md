# 📊 Social Media Content Analyzer

A full-stack web application that helps content creators optimize their social media strategy.  
It extracts text from uploaded documents (PDFs, Images) and uses **Google Gemini AI** to generate actionable engagement tips, hooks, captions, and hashtag strategies.

🔗 **Live Demo:** https://social-media-analyzer-silk.vercel.app

> **⚠️ Note:** The backend is hosted on **Render’s free tier**, so the first request may take **30–50 seconds** to wake up. If you see a connection error, wait a moment and refresh.

---

## 🚀 Features

- **Multi-Format Upload:** Drag & drop PDFs, JPGs, PNGs.
- **Smart Extraction**
  - **OCR with Tesseract.js**
  - **PDF parsing with pdf-parse**
- **AI-Powered Suggestions:**  
  Improvements for captions, hooks, tone, hashtags, and more using **Gemini 2.0 Flash**.
- **Batch File Processing:** Upload multiple files at once with progress updates.
- **History Dashboard:** All analyses are auto-saved to MongoDB.
- **Search in History:** Quickly filter results by filename or extracted content.

---

## 🛠️ Tech Stack

### **Frontend**
- React 18 + Vite  
- TypeScript  
- Tailwind CSS + Shadcn UI  
- TanStack Query  

### **Backend**
- Node.js + Express  
- MongoDB + Mongoose  
- Service-Based Architecture (OCR, PDF, AI separated)

### **AI & Processing**
- Google Gemini 2.0 Flash  
- Tesseract.js  
- pdf-parse  

---

### **1. Clone the Repository**

```bash
git clone https://github.com/PranjalTheCoder/Social-Media-Analyzer.git
cd Social-Media-Analyzer
```

---

### **2. Backend Setup (Server)**

```bash
cd server
npm install
```
---
### Create `.env` file inside `server/`:

```bash
PORT=5000

# Use local MongoDB or Atlas
MONGODB_URI=mongodb://127.0.0.1:27017/content_analyzer

# Get your free Gemini API key:
# https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_google_api_key_here
```

## Start the server:
```bash
npm run dev
```

--- 

### 3. Frontend Setup (Client)

Open a new terminal window:
```bash
cd client
npm install
npm run dev
```