# Design Guidelines: Social Media Content Analyzer

## Design Approach

**Selected Approach:** Modern Clean UI (Shadcn UI + Tailwind CSS)
**Justification:** We chose this because it looks professional, clean, and "out of the box" accessible. It allows us to focus on the functionality (analyzing text) without fighting with custom CSS. It feels like a modern productivity tool—fast, minimal, and distraction-free.

**Key Principles:**
- **Simplicity:** If it doesn't help the user analyze text, remove it.
- **Visual Hierarchy:** Important numbers (like scores) are big; secondary details are smaller and gray.
- **Feedback:** The user should always know what's happening (e.g., "Processing...", "Copied to clipboard").

---

## Typography

**Font Family:** System Sans-Serif (defaults to Inter or the user's OS font).
- We use the standard Tailwind `font-sans` stack for fast loading and native feel.

**Type Scale:**
- **Page Title:** Big and bold (`text-3xl` to `text-4xl`), often with a gradient effect (`bg-gradient-to-r`) to make it pop.
- **Section Headers:** Clear and distinct (`text-xl`, `font-semibold`).
- **Body Text:** Readable size (`text-sm` or `text-base`).
- **Monospace:** Used specifically for the "Extracted Text" area to show raw content clearly.

---

## Component Library

### 1. Navigation & Layout
- **Header:** Centered title with a gradient effect. Includes a "History" button on the right that opens a sidebar.
- **Tabs:** A switcher at the top to toggle between "Single File" and "Batch Upload" modes.
- **Sidebar (Sheet):** A slide-out panel on the right side that lists previous analysis history. It stays hidden until needed to save screen space.

### 2. Upload Section
- **Dropzone:** A large, dashed-border box that highlights when you drag a file over it.
- **Icons:** We use `lucide-react` icons (like `Upload`, `FileText`, `Image`) because they are clean and consistent.
- **Batch List:** In batch mode, files appear as a list with individual "remove" (X) buttons.

### 3. Loading States
- **Skeletons:** Gray pulsing bars that act as placeholders while data is loading (better than just a blank screen).
- **Spinners:** Simple rotating circles inside buttons to show an action is in progress.
- **Progress Bar:** A blue line that fills up during batch processing so the user knows how many files are done.

### 4. Results Panel
- **Metrics Cards:** Top row showing "Word Count", "File Type", "Readability", and "Sentiment" in big, bold numbers.
- **Split View:** Two main cards side-by-side on desktop:
  - **Left:** Raw Extracted Text (for verification).
  - **Right:** AI Suggestions (the actionable advice).
- **Action Buttons:** Small "Copy" and "Download" buttons on cards for quick utility.

### 5. Notifications (Toasts)
- **Popups:** Small cards that appear at the bottom right to confirm actions (e.g., "Copied!", "Analysis Complete") or warn of errors (e.g., "File too large").

---

## Colors & Theming

**System:** CSS Variables (HSL)
- **Background:** Clean white (or dark gray in dark mode).
- **Primary Color:** A deep blue/slate (used for buttons and active states).
- **Muted/Secondary:** Light grays for borders, backgrounds of cards, and secondary text.
- **Destructive:** Red for errors or delete actions.

---

## Interaction Patterns

### Upload Flow
1. **Select Mode:** User clicks "Single" or "Batch" tab.
2. **Drag & Drop:** User drags a file. The box turns blue/shaded to indicate it's active.
3. **Processing:** The upload box disappears and is replaced by a "Loading..." state or Progress bar.
4. **Success:** The results fade in automatically below the upload area.

### History Access
- User clicks the "History" clock icon in the top right.
- A sidebar slides out.
- Clicking an item in history instantly loads that old analysis into the main view.

### Mobile Responsiveness
- **Desktop:** Results show side-by-side (Text vs. AI).
- **Mobile:** Results stack vertically (Metrics -> Text -> AI). The History sidebar covers the full screen when opened.

---

## Accessibility

- **Keyboard Navigation:** All buttons and inputs can be reached with the `Tab` key.
- **Labels:** Upload inputs have `aria-label` text so screen readers know what they are.
- **Contrast:** Text colors are chosen to ensure they are readable against the background.