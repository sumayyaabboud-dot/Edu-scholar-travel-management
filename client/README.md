# Edu-Scholar Travel Management System — Frontend

React + TypeScript + Tailwind CSS client for the Edu-Scholar platform.

## Pages
- **Landing** — public marketing page
- **Login** — authenticates against the backend, redirects by role
- **Create Account** (`/create-account?token=...`) — password setup for invited
  students and donors
- **Super Admin** — Scholarship Offers (create/edit/status) and Donor Management
- **School Admin** — Student Roster (filters, CSV export, certificate upload,
  application detail, cascading delete) and New Application
- **Student Portal** — application status, AI Match Score, live chatbot
  (rate-limited to 15 questions per 12-hour window)
- **Donor Country** — batch review, Grant/Waitlist decisions, decision report PDF
- **Travel Agency** — booking queue, process/confirm booking, manifest CSV export

## Tech Stack
- React + TypeScript (Vite)
- Tailwind CSS v4
- React Router
- Dark/light theme toggle, shared across all dashboards

## Running the frontend

cd client
npm install
npm run dev


Requires a `.env` file with:

VITE_API_URL=http://localhost:5000/api


## Status
✅ All pages and dashboards built and tested end-to-end against the real backend API.

4. Save.

Push it

5. Source Control → commit message:

Update backend and frontend READMEs to reflect completed project state