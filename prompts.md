# Prompts.md — AI Usage Log

## Sprint 13 — Planning Phase

### Overview
During the planning phase of TaskMatrix, I used AI (Claude) primarily as a guide 
to understand concepts I wasn't familiar with — Figma basics, database design 
logic, and project architecture decisions. Below are some of the key prompts 
and queries I used.

### Planning & Scope
- "I'm building TaskMatrix, an Agile project management tool like Jira/Asana. 
  What modules should I include for the planning sprint?"
- "What's the difference between Frontend and Fullstack track requirements 
  for this capstone?"

### Tech Stack Decisions
- "Should I use Next.js or React with Vite for this project?" — I chose React 
  (Vite) since I'm already familiar with it and the assignment allowed both 
  options for the Fullstack track.

### Figma / Wireframing
- Asked for help understanding basic Figma tools (frames, rectangles, text tool) 
  since I hadn't used Figma before.
- Used AI-generated reference images to get a visual idea of a professional 
  login screen and Kanban dashboard layout, then rebuilt the structure myself 
  in Figma using rectangles, text, and color fills.

### Database Design
- "Explain what a Primary Key and Foreign Key mean in simple terms."
- "How many tables should a project management app typically need?"
- Used dbdiagram.io syntax help to define relationships between Users, 
  Projects, Tasks, and Comments tables.

### Reflection
Using AI helped me move faster through unfamiliar tools like Figma and 
dbdiagram.io, but the actual decisions — project scope, tech stack choice, 
and database structure — were made by me based on the requirements. This 
process also helped me understand *why* each part of the architecture 
matters, not just how to build it.

---

## Sprint 14 — Authentication (Walking Skeleton)

### Overview
This sprint focused on building a working authentication system — register, 
login, JWT-based sessions, and a protected dashboard route. I used AI to 
understand the underlying concepts and to troubleshoot environment issues, 
rather than just copying code without understanding it.

### Backend & Auth Logic
- "Explain what a JWT is and how it's used for authentication in simple terms."
- "How do I hash a password with bcrypt before saving it to MongoDB?"
- "What does authentication middleware actually do, and why is it needed?"
- Asked for help structuring the backend: models, routes, and middleware 
  separation, and understanding why each file has a specific responsibility.

### Frontend Integration
- "How do I send a POST request from React to my backend and store the 
  returned token?"
- "What's the correct way to protect a route in React Router so only 
  logged-in users can access it?"

### Debugging
- Ran into a "Cannot find module @rollup/rollup-win32-x64-msvc" error when 
  starting the frontend. Used AI to diagnose the root cause — an incompatible 
  Node.js version (v24, too new for Rollup's native bindings) — and resolved 
  it by switching to Node.js LTS (v22).
- Asked for guidance on setting up a MongoDB Atlas database and correctly 
  formatting the connection URI, including handling the database name and 
  password placement.

### Reflection
This sprint involved more hands-on debugging than Sprint 13 — particularly 
the Node.js version issue, which wasn't a code problem but an environment 
compatibility issue. Working through it helped me understand how backend 
tooling depends on the underlying runtime version, not just the code itself. 
The core authentication logic (password hashing, JWT signing/verification, 
protected routes) was implemented and tested end-to-end locally before moving 
to deployment.
