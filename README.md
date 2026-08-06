# TaskMatrix

## Description
TaskMatrix is a scalable Agile Project Management tool inspired by Jira/Asana, built to help software teams manage projects, tasks, and workflows efficiently.

## Track
Fullstack

## Tech Stack
- Frontend: React (Vite), Zustand (state management), Axios, React Router
- Backend: Node.js, Express.js, Mongoose
- Authentication: JWT (jsonwebtoken), bcryptjs (password hashing)
- Payments: Stripe (Test Mode)
- Database: MongoDB (MongoDB Atlas)
- Design: Figma
- Architecture Diagram: dbdiagram.io
- Deployment: Vercel (Frontend), Render (Backend)

## Core Features
- ✅ User Authentication (Signup/Login) — implemented (Sprint 14)
- ✅ JWT-based Protected Routes — implemented (Sprint 14)
- ✅ Project Creation & Membership Management — implemented (Sprint 15)
- ✅ Task Creation, Assignment & Priority Tagging — implemented (Sprint 15)
- ✅ Data Ownership Validation (403 on unauthorized edit/delete) — implemented (Sprint 15)
- ✅ Kanban Board (To Do / In Progress / Done) — implemented (Sprint 15)
- ✅ List View, Calendar View, Timeline View — implemented (Sprint 15)
- ✅ Reports (charts by status/priority) — implemented (Sprint 15)
- ✅ File Uploads (project-scoped, with mandatory justification note) — implemented (Sprint 15)
- ✅ Stripe Checkout — Upgrade to Pro flow — implemented (Sprint 15)
- ✅ Deadline Tracking — implemented (Sprint 15)
- 🚧 Real-time Activity Feed — planned
- 🚧 Role Management (granular permissions) — planned

## Figma Wireframes
- Login Screen: https://www.figma.com/design/TVU1s0BsYSZmCcdLO3hqxH?node-id=0-1
- Dashboard / Board Screen: https://www.figma.com/design/TVU1s0BsYSZmCcdLO3hqxH?node-id=1-211
- Task Detail Screen: https://www.figma.com/design/TVU1s0BsYSZmCcdLO3hqxH?node-id=14-23

## Database Architecture (ERD)
Live/Edit Diagram: https://dbdiagram.io/d/TaskMatrix-ERD-6a6032bbc3a90dd98d8a6c27

---

## Sprint 14 — Authentication (Walking Skeleton)
This sprint focused on building a secure, functional authentication pipeline end-to-end. UI styling was intentionally kept minimal as per the sprint guidelines.

### What Was Built
- User registration with bcrypt password hashing (passwords are never stored in plain text)
- Login with JWT token generation
- Protected `/dashboard` route using JWT verification middleware
- Automatic redirect to `/login` if no valid token is present
- Profile card displaying authenticated user information (name, email, user ID, account creation time, login time)

---

## Sprint 15 — Task CRUD, Projects & Stripe Payments
This sprint focused on full CRUD for tasks, strict data ownership, project-based team scoping, and payment integration.

### What Was Built
- **Projects**: users can create projects and add members by email. Tasks and task assignment are scoped to a project — a task can only be assigned to someone who is a member of that project.
- **Task CRUD**: create, read, update, delete, all JWT-protected.
- **Data Ownership**: only the creator of a task can edit or delete it (backend returns `403 Forbidden` otherwise).
- **Optimistic UI**: deleting a task removes it from the screen instantly, without waiting for the server response.
- **Kanban Board**: tasks grouped into To Do / In Progress / Done columns, moved between columns via a status dropdown.
- **List View**: sortable table view of all tasks (by deadline, priority, or title).
- **Calendar & Timeline views**: tasks grouped by deadline, and a chronological activity view.
- **Reports**: pie chart (tasks by status) and bar chart (tasks by priority), plus summary stats.
- **Files**: file uploads are scoped to a project and require a short note explaining why the file is needed.
- **Stripe Checkout**: "Upgrade to Pro" triggers a Stripe test-mode Checkout session; on success, the backend verifies the session and marks the user's account as Pro.
- **Responsive layout**: collapsible sidebar (hamburger menu) on mobile/tablet screens.

## Live Links
- **Frontend (Vercel):** https://prodesk-capstone-taskmatrix-two.vercel.app
- **Backend (Render):** https://prodesk-capstone-taskmatrix-ahqg.onrender.com

## Project Structure
backend/
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   └── FileUpload.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   ├── fileRoutes.js
│   └── paymentRoutes.js
├── middleware/
│   └── authMiddleware.js
└── server.js
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx (Board)
│   │   ├── ListView.jsx
│   │   ├── Calendar.jsx
│   │   ├── Timeline.jsx
│   │   ├── Reports.jsx
│   │   ├── Files.jsx
│   │   ├── Team.jsx
│   │   ├── Settings.jsx
│   │   ├── Profile.jsx
│   │   ├── Upgrade.jsx
│   │   ├── PaymentSuccess.jsx
│   │   └── ProtectedRoute.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── AppLayout.jsx
│   │   ├── CreateProjectModal.jsx
│   │   └── NoProjectState.jsx
│   ├── context/
│   │   └── ProjectContext.jsx
│   └── api/
│       └── axios.js
## How to Run Locally

### Backend
cd backend
npm install
Create a `.env` file with:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
STRIPE_SECRET_KEY=your_stripe_test_secret_key
CLIENT_URL=http://localhost:5173
Run the server:
npm start
### Frontend
cd frontend
npm install
npm run dev
