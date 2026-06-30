# 🚀 TrackIt SaaS (Expense Tracker)

TrackIt is a modern, full-stack personal finance application designed with a SaaS-like experience. Built on the MERN stack with a beautiful, responsive UI.

## Features
- **Dashboard & Analytics:** Real-time metrics and interactive charts using Recharts.
- **Expense & Income Tracking:** Fully paginated, searchable, and filterable transactions.
- **Receipt Scanning:** Extract data from receipts automatically using Tesseract.js OCR.
- **Budget Alerts & Scheduled Tasks:** Set monthly budgets and handle scheduled tasks via Node-Cron.
- **Security First:** JWT authentication, Helmet headers, Rate limiting, and Bcrypt hashing.
- **Export Reports:** Download reports instantly in PDF (PDFKit) and Excel (XLSX) formats.
- **Modern UI & Animations:** Fluid animations with Framer Motion, styled with TailwindCSS.

## Tech Stack
- **Frontend:** React (Vite), React Router, TailwindCSS, Framer Motion, Recharts, Tesseract.js, Axios.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Bcryptjs, Helmet, Express-Rate-Limit, PDFKit, XLSX, Node-Cron.

## Quick Start

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file and fill in your `MONGO_URI`, `PORT`, and JWT secrets.
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Deployment

### Deploy Backend (Render / Railway)
- Add your environment variables.
- Start command: `npm start` (or `node server.js`)

### Deploy Frontend (Vercel / Netlify)
- Set build command: `npm run build`
- Set publish directory: `dist`
- Update the API base URL in your frontend configuration if hosting remotely.

---
*Developed as part of the Advanced Agentic Coding Internship.*
