# ICAN Conundrum Cards Database — Web Workspace

A clean, modern Next.js + TypeScript web application connected to the **ICAN Conundrum Cards Database** Google Sheet (`1OkTnHn6l7dsmJ67GgmebhOH-DLWssIbAMF3iHFlDr3E`).

It reads and joins two tabs on `Card ID` (`CON-001` through `CON-084`):
- **`Conundrum Database`**: Card ID, Title, Category / Theme, Objective, Requirements 1–5, Deliverables, Focus Areas / Disciplines, Status, Notes
- **`Worksheet Content Database`**: Card ID, Title, Category / Theme, plus all **Lower (G1–2)**, **Middle (G3–4)**, and **Upper (G5–6+)** Passages, Vocab 1–4, Questions Q1–Q5, Activities/Labs, and Answer Keys

---

## Quick Start (Instant Preview)

No credentials are required to preview immediately—a full 84-card snapshot exported from your Google Sheet is bundled in `src/data/` and loads automatically as a fallback.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Connecting Live to Your Google Sheet

Copy `.env.example` to `.env.local` and configure **one** of the three live connection methods below, then restart `npm run dev` (or click **Sync** in the top header).

### Option A: Google Cloud Service Account (Recommended for Private Sheets)
1. Open [Google Cloud Console](https://console.cloud.google.com/), create/select a project, and enable **Google Sheets API**.
2. Go to **IAM & Admin → Service Accounts → Create Service Account** and generate a JSON key.
3. Open your Google Sheet and **Share** it with the service account's `client_email` as **Viewer**.
4. Add to `.env.local`:
   ```env
   GOOGLE_SHEETS_SPREADSHEET_ID=1OkTnHn6l7dsmJ67GgmebhOH-DLWssIbAMF3iHFlDr3E
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Option B: Google Sheets API Key (Link-Shared Sheet)
1. Set your Google Sheet sharing to **Anyone with the link → Viewer**.
2. Create an API key in Google Cloud Console with **Google Sheets API** enabled.
3. Add to `.env.local`:
   ```env
   GOOGLE_SHEETS_SPREADSHEET_ID=1OkTnHn6l7dsmJ67GgmebhOH-DLWssIbAMF3iHFlDr3E
   GOOGLE_SHEETS_API_KEY=AIzaSy...
   ```

### Option C: Google Apps Script Web App (Zero GCP Setup)
1. In your Google Sheet, go to **Extensions → Apps Script**.
2. Paste the contents of [`apps-script/Code.gs`](./apps-script/Code.gs) and save.
3. Click **Deploy → New deployment → Web app** (`Execute as: Me`, `Who has access: Anyone`).
4. Copy the Web App URL into `.env.local`:
   ```env
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Key Features
- **Top Header**: ICAN Conundrum Cards branding, live active card count, data source indicator, manual Sync button, Google Sheets Setup modal, and interactive quick-stats cards across all 6 themes.
- **Search & Filters**: Instant search across Card ID, Title, Objective, Deliverables, Focus Areas / Disciplines, Notes, and Vocabulary, plus Category / Theme and Status filter pills.
- **Responsive Two-Pane Workspace**: Scrollable card catalog on the left (collapsible drawer on mobile) paired with the full workspace view on the right.
- **Differentiated Worksheets**: Seamless switcher for **Lower (G1–2)**, **Middle (G3–4)**, and **Upper (G5–6+)** plus a **Grade Progression** side-by-side comparison view, a **Teacher Answer Keys** toggle, and print-friendly layout.
