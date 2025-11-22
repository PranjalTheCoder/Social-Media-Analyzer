# Project Approach & Technical Decisions

## 🎯 Goal
The main goal was to build a tool that actually helps creators. Instead of just dumping data, I wanted the app to look at their PDF or Image uploads and give specific, actionable advice using AI—like a social media consultant in your pocket.

## 🏗️ Architecture: Why I Split the App
I decided to separate the project into two distinct parts: a **Client** (Frontend) and a **Server** (Backend).

* **Frontend (Client)**: This is what the user sees. I built it with **React** because it’s fast and interactive. I used **Vite** to make the development experience snappy.
* **Backend (Server)**: This does the heavy lifting. It receives files, talks to the database, and manages the AI. I used **Express.js** because it’s reliable and easy to scale.
* **Database**: I chose **MongoDB** because the data we get from AI (like suggestions and sentiment scores) varies a lot. MongoDB is flexible enough to store this "unstructured" data without needing strict tables like SQL.

## 💡 Key Decisions & Challenges

### 1. Handling Different File Types
One of the trickiest parts was reading text from different formats.
* **For PDFs**: I used a library called `pdf-parse`. It’s a bit older, so I had to write a special adapter (using `createRequire`) to make it work with modern Node.js code.
* **For Images**: I used `tesseract.js` (OCR). This allows users to upload a screenshot of a post or a photo of a document, and the system can still read the text.

### 2. Keeping the App "Alive" (Fault Tolerance)
External services like Google's AI can sometimes be slow or hit rate limits. I didn't want the whole app to crash if that happened.
* **My Solution**: I wrapped the AI logic in safety blocks (`try-catch`). If the AI fails, we still save the file and the extracted text to the database. The user sees their upload in the history, just without the AI suggestions, instead of seeing a big "Error" screen.

### 3. Making Batch Uploads Smooth
Uploading 10 files at once can freeze a server if you're not careful.
* **My Solution**: I set up the backend to loop through the files one by one. The frontend shows a progress bar so the user knows exactly what's happening—"Processing file 3 of 10..."—which feels much better than a spinning loading wheel.

### 4. Type Safety with TypeScript
I used **TypeScript** for both the frontend and backend.
* **Why?**: It prevents silly mistakes, like trying to access a property that doesn't exist. It ensures that the data structure the server sends is exactly what the client expects (e.g., making sure we always have a `fileName` and `_id`).

## 🎨 User Experience (UX)
I didn't want this to look like a boring dashboard.
* I used **Shadcn UI** and **Tailwind CSS** to give it a clean, modern feel right out of the box.
* I added **Loading States** everywhere. If data is being fetched or processed, the user sees a skeleton loader or a spinner, so they never wonder "is it working?"