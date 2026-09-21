# Edu-Scholar Travel Management System

Final Project — MERN-stack platform for managing international scholarships,
from application through donor decision to travel booking.

## Roles
- **Super Admin** — publishes and manages scholarship offers
- **School Admin** — submits applications on behalf of students
- **Student** — views their own application status
- **Donor Country** — reviews and grants/waitlists applications
- **Travel Agency** — books flights with automated discount calculation

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS (in progress)
- Backend: Node.js + Express
- Database: MongoDB (Atlas)
- Auth: JWT (access + refresh tokens), bcrypt
- Email: Nodemailer + Mailtrap
- PDF Reports: pdfkit

## Status
✅ Backend complete — all functional requirements (FR-01 to FR-09) implemented
and tested end-to-end, including AI Match Score, email notifications, and PDF
reports. Two features (OCR, Chatbot) are intentionally simplified for this
build — see Section 13 of the BRD for the documented rationale.

🚧 Frontend — in progress.

## Running the backend

cd server
npm install
npm run dev

Requires a `.env` file with `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, `MAILTRAP_PASS`, `LLM_API_KEY`.

To load sample data: `npm run seed`