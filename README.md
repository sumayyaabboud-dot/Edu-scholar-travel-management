# Edu-Scholar Travel Management System — Backend

Final Project — MERN-stack platform for managing international scholarships,
from application through donor decision to travel booking.

## Roles
- **Super Admin** — publishes and manages scholarship offers; creates and manages Donor entities
- **School Admin** — submits applications on behalf of students; manages their school's roster
- **Student** — views their own application status; activates their account via a secure email invite
- **Donor Country** — reviews and grants/waitlists applications for their assigned country
- **Travel Agency** — books flights with automated discount calculation

## Tech Stack
- Backend: Node.js + Express
- Database: MongoDB (Atlas)
- Auth: JWT (access + refresh tokens), bcrypt
- Email: Nodemailer + Mailtrap
- File uploads: multer
- PDF Reports: pdfkit

## Status
✅ **Backend complete** — all functional requirements (FR-01 to FR-09) implemented
and tested end-to-end, including AI Match Score, email notifications, PDF reports,
certificate uploads, and cascading delete.

✅ **Donor entity management** — Super Admin creates Donor sponsor records
(separate from the Donor Country login role), linked to scholarship offers.

✅ **Secure onboarding** — Students and Donors activate their accounts via a
time-limited email invite link rather than a shared default password. Existing
accounts created before this feature remain unaffected.

✅ **Frontend complete** — all 5 role dashboards built and tested (see `/client`).

Two features (OCR, Chatbot) are intentionally simplified for this build — see
Section 13 of the BRD for the documented rationale.

## Running the backend

cd server
npm install
npm run dev


Requires a `.env` file with:

MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USER=
MAILTRAP_PASS=
LLM_API_KEY=
FRONTEND_URL=http://localhost:5173


To load sample data: `npm run seed`

## Utility scripts
- `node fixSeatsAllocated.js` — recalculates `seats_allocated` on every offer from real Granted counts
- `node fixMatchScores.js` — recalculates `ai_match_score` on every application from the real formula
- `node checkMatchScores.js` — prints a side-by-side report of stored vs. recomputed match scores
- `node resetChatbotUsage.js` — resets every student's chatbot question count to 0