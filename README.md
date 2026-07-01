# Class Management System (MERN Stack)

A full-stack Class Management System built with **MongoDB, Express, React, and Node.js**.
Covers the 14 core "Final Year Project" modules: Authentication, Student Management, Teacher
Management, Course Management, Batch Management, Attendance, Fee Management, Exams & Results,
Study Materials, Placement Management, Notifications, Admin Dashboard, Reports, and role-based
access control. (AI Chatbot module is left as a clearly marked extension point — see "What's
Not Included" below.)

## Tech Stack
- **Frontend:** React 18, React Router v6, Axios, Recharts
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Auth:** JWT + bcrypt password hashing, role-based access control (admin / teacher / student)
- **File uploads:** Multer (profile pictures, study materials)

## Project Structure
```
cms-mern/
├── backend/
│   ├── config/db.js
│   ├── models/            (User, Student, Teacher, Course, Batch, Attendance, Fee, Exam,
│   │                        Result, Material, Notification, Placement)
│   ├── controllers/
│   ├── routes/
│   ├── middleware/        (auth + file upload)
│   ├── uploads/           (uploaded files served statically)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.js
    │   ├── components/ (Layout, ProtectedRoute)
    │   ├── pages/      (Login, Register, Dashboard, Students, Teachers, Courses, Batches,
    │   │                Attendance, Fees, Exams, Materials, Placements, Notifications, Profile)
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env if needed (MONGO_URI, JWT_SECRET, etc.)
npm run dev      # uses nodemon, or `npm start` for plain node
```
Backend runs on **http://localhost:5000**.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```
Frontend runs on **http://localhost:3000**.

### 3. First-time use
1. Go to `http://localhost:3000/register`
2. Register the **first user as `admin`** — this account manages everything else.
3. Log in, then use the Admin Dashboard to add Courses → Batches → Teachers → Students.
4. Subsequent student/teacher accounts are best created from the **Students/Teachers pages**
   by the admin (this auto-generates Student ID / Teacher ID), rather than the public register
   page — though the register page works too for quick testing of all three roles.

## Modules Implemented
| Module | Status |
|---|---|
| Authentication (JWT, roles, password reset via profile) | ✅ |
| Student Management (CRUD, ID generation, search) | ✅ |
| Teacher Management (CRUD, subjects, salary) | ✅ |
| Course Management (CRUD) | ✅ |
| Batch Management (create, assign students/teacher, schedule) | ✅ |
| Attendance (mark per batch/date, history, % calculation) | ✅ |
| Fee Management (create record, partial payments, receipts, summary) | ✅ |
| Exam & Result Management (create exam, enter marks, auto grade/rank) | ✅ |
| Study Materials (upload/download PDFs, notes, videos) | ✅ |
| Placement Management (track applications, stats) | ✅ |
| Notifications/Announcements (role-targeted) | ✅ |
| Admin Dashboard (live stats, charts) | ✅ |
| Reports | Derived from existing endpoints (attendance %, fee summary, rank lists, placement stats) |
| Role-Based Access Control | ✅ (admin / teacher / student middleware) |

## What's Not Included (clearly marked extension points)
- **AI Chatbot / AI features** — these are genuinely separate sub-projects (need an LLM API
  key and a dedicated chat UI). Not stubbed in to avoid giving you fake/non-functional code.
- **Library, Event, Inquiry, Certificate modules** — same CRUD pattern as Course/Batch above;
  not included only to keep this deliverable focused and runnable. Ask if you want any of
  these added — they follow the exact same model → controller → routes → page pattern already
  used throughout, so they're quick to add.
- **Cloudinary integration** — currently uses local disk storage via Multer (simpler to run
  locally). Swapping to Cloudinary is a small change in `uploadMiddleware.js`.
- **SMS/Email sending** — Notification module stores in-app notifications; wiring to an actual
  SMS/email provider (Twilio, Nodemailer) needs your API credentials.

## Notes for Your Project Submission
- Default passwords for admin-created students/teachers are `student123` / `teacher123` —
  **change `JWT_SECRET` in `.env` before any real deployment.**
- All passwords are hashed with bcrypt; never stored in plain text.
- This is a genuine working CRUD app — run both servers and it functions end-to-end with a
  real database. It is not a UI mockup.
