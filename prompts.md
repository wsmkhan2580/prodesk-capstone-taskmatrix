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
  starting the frontend. Traced it back to an incompatible Node.js version 
  (v24, too new for Rollup's native bindings) and resolved it by switching 
  to Node.js LTS (v22).
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

---

## Sprint 15 — Task CRUD, Projects & Stripe Payments

### Overview
This was the heaviest sprint so far — full CRUD on tasks, ownership rules, 
a proper project/membership structure, and Stripe payments. A lot of this 
sprint was less about writing new code from scratch and more about debugging 
why things weren't connecting properly between frontend, backend, and the 
deployed environment.

### CRUD & Ownership
- "How do I make sure a user can only edit or delete tasks they created, 
  not anyone else's?"
- "What's the right way to check ownership on a PUT/DELETE route before 
  running the update?"
- Realized partway through that letting any registered user get assigned to 
  any task made no sense — there was no concept of teams or project boundaries. 
  Had to rethink the data model and add a proper Project entity with a 
  members list, so task assignment is restricted to people actually on 
  that project.

### Frontend State & UX
- "How do I implement optimistic UI so a deleted task disappears immediately 
  instead of waiting for the server response?"
- Asked how to structure a shared layout (navbar + sidebar) so it doesn't 
  have to be repeated on every page — ended up using a context provider to 
  track the currently selected project across the whole app.

### Stripe Integration
- "How does Stripe Checkout actually work end to end — what happens on my 
  backend vs what Stripe hosts?"
- "Why should the Stripe secret key never be in frontend code?"
- Learned the difference between the publishable key (frontend) and secret 
  key (backend only), and how the success/cancel URL redirect flow works 
  after a test payment.

### Deployment Debugging (the most time-consuming part)
- Hit a "Could not load tasks" error and multiple 401/404s in the console 
  after deploying. Went through this step by step:
  - First suspected a JWT secret mismatch between local and Render.
  - Cleared the browser's localStorage and re-logged in to rule out a stale token.
  - Checked Render's environment variables to confirm they matched local `.env`.
  - Used the Network tab to inspect the actual failed request/response instead 
    of guessing from the UI error message alone.
  - The real cause turned out to be simpler than expected — the logged-in 
    account just didn't have any project created yet, so `projectId` was 
    undefined on every request. Once a project was created, tasks and 
    members loaded normally.
- Also hit a confusing case where two deployments (Render + Vercel) had 
  drifted out of sync from separate deploys off the same repo — had to 
  confirm which backend URL was actually live and update `axios.js` to 
  point at the correct one, including remembering to append `/api` to 
  the base URL.

### Reflection
Most of the actual "bugs" this sprint weren't logic errors in the code — 
they were state/environment issues: stale tokens, mismatched env variables, 
and a missing project before tasks could exist. The debugging process pushed 
me to actually read Network tab responses and Render logs instead of guessing 
from symptoms, which was a more realistic version of what real backend 
debugging looks like.
