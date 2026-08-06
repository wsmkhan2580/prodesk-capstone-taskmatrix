TaskMatrix

Description

TaskMatrix is a scalable Agile Project Management tool inspired by Jira/Asana, built to help software teams manage projects, tasks, and workflows efficiently.

Track

Fullstack

Tech Stack

- Frontend: React (Vite), Tailwind CSS, Zustand (state management), Axios, React Router
- Backend: Node.js, Express.js, Mongoose
- Authentication: JWT (jsonwebtoken), bcryptjs (password hashing)
- Database: MongoDB (MongoDB Atlas)
- Design: Figma
- Architecture Diagram: dbdiagram.io
- Deployment: Vercel (Frontend), Render (Backend)

Core Features

- ✅ User Authentication (Signup/Login) — implemented (Sprint 14)
- ✅ JWT-based Protected Routes — implemented (Sprint 14)
- 🚧 Project Creation & Management — planned (Sprint 15)
- 🚧 Task Creation, Assignment & Priority Tagging — planned (Sprint 15)
- 🚧 Drag-and-Drop Kanban Board (To Do / In Progress / Done) — planned (Sprint 15)
- 🚧 Deadline Tracking — planned (Sprint 15)
- 🚧 Real-time Activity Feed — planned
- 🚧 Role Management — planned

Figma Wireframes

- Login Screen: https://www.figma.com/design/TVU1s0BsYSZmCcdLO3hqxH?node-id=0-1
- Dashboard / Board Screen: https://www.figma.com/design/TVU1s0BsYSZmCcdLO3hqxH?node-id=1-211
- Task Detail Screen: https://www.figma.com/design/TVU1s0BsYSZmCcdLO3hqxH?node-id=14-23

Database Architecture (ERD)

Live/Edit Diagram: https://dbdiagram.io/d/TaskMatrix-ERD-6a6032bbc3a90dd98d8a6c27

---

Sprint 14 — Authentication (Walking Skeleton)

This sprint focused on building a secure, functional authentication pipeline end-to-end. UI styling was intentionally kept minimal as per the sprint guidelines.

What Was Built

- User registration with bcrypt password hashing (passwords are never stored in plain text)
- Login with JWT token generation
- Protected "/dashboard" route using JWT verification middleware
- Automatic redirect to "/login" if no valid token is present
- Profile card displaying authenticated user information:
  - Name
  - Email
  - User ID
  - Account Creation Time
  - Login Time

Live Links

Frontend (Vercel):
https://prodesk-capstone-taskmatrix-two.vercel.app/login

Backend (Render):
https://prodesk-capstone-taskmatrix-ahqg.onrender.com

Project Structure

backend/
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── dashboardRoutes.js
├── middleware/
│   └── authMiddleware.js
└── server.js

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── ProtectedRoute.jsx
│   └── api/
│       └── axios.js

How to Run Locally

Backend

cd backend
npm install

Create a ".env" file with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

Run the server:

npm start

Frontend

cd frontend
npm install
npm run dev
