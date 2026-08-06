# TaskMatrix — Sprint 14 Setup Instructions

## Backend Setup

1. Open a terminal inside the `backend` folder.
2. Run:
   ```
   npm install
   ```
3. Rename `.env.example` to `.env` and fill in your real values:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=any_random_secret_string
   PORT=5000
   ```
4. Start the server:
   ```
   npm start
   ```
   You should see "MongoDB connected" and "Server running on port 5000" in the terminal.

## Frontend Setup

1. Open a terminal inside the `frontend` folder.
2. Run:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the link shown in the terminal (usually `http://localhost:5173`).

## What this does

- `/register` — create a new account (password is hashed with bcrypt before saving)
- `/login` — log in, receive a JWT token, stored in localStorage, redirects straight to `/dashboard`
- `/dashboard` — shows task stats (total, To Do, In Progress, Done, assigned to you)
- `/tasks` — Kanban board (To Do / In Progress / Done columns). Full CRUD, deadline and assignee are required fields, search bar filters by title, moving a task between columns updates its status.
- `/calendar` — tasks grouped by deadline date
- `/timeline` — all tasks listed chronologically by creation date, with a status indicator
- `/reports` — charts (pie chart by status, bar chart by priority) plus summary stats
- `/files` — upload, list, and delete files (stored on the backend's `/uploads` folder, tracked in MongoDB)
- `/team` — list of all registered users
- `/settings` — update your display name, view your email, logout
- `/profile` — account details and subscription status (Free/Pro)
- `/upgrade` — triggers a Stripe Checkout session (test mode)
- `/payment-success` — confirms payment and activates Pro status

Every task is tied to the user who created it (ownership check on the backend
— a user cannot edit or delete another user's task, even by guessing the task ID).

## Navbar

Every protected page shows a shared navbar:
- **Left:** TaskMatrix logo, links back to Dashboard
- **Right:** a circular avatar showing the first letter of the user's name.
  Clicking it opens a dropdown with the full profile card (name, email, user ID,
  status, login time) and a Logout button.

## Stripe setup (required for the Upgrade flow to work)

1. Create a free account at https://dashboard.stripe.com/register
2. Go to Developers → API keys, copy your **Secret key** (starts with `sk_test_`)
3. Add it to your backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   CLIENT_URL=http://localhost:5173
   ```
4. When deploying, update `CLIENT_URL` to your live Vercel URL, and add the
   same environment variables in Render's dashboard.

## Before deploying

- Update `frontend/src/api/axios.js` — change `API_BASE_URL` to your deployed Render backend URL.
- On Render (backend) and Vercel (frontend), add the same environment variables from your `.env` file in their project settings.

## Explaining each part (for your demo video)

- **models/User.js** — defines what a user looks like in the database (name, email, hashed password).
- **routes/authRoutes.js** — handles register and login logic, including password hashing and JWT creation.
- **middleware/authMiddleware.js** — checks incoming requests for a valid JWT before allowing access to protected data.
- **routes/dashboardRoutes.js** — an example protected route that only responds if the middleware confirms a valid token.
- **models/Task.js** — defines a task, including `authorId`, which records which user created it.
- **routes/taskRoutes.js** — full CRUD for tasks. On update/delete, it checks that `task.authorId` matches the logged-in user's ID before allowing the action — this is the data ownership rule.
- **frontend/src/pages/Tasks.jsx** — task list, create/edit form, and delete buttons. Deleting uses optimistic UI: the task is removed from the screen immediately, without waiting for the server response.
- **frontend/src/components/Navbar.jsx** — shared navbar with logo and profile avatar dropdown, used on every protected page.
- **backend/routes/paymentRoutes.js** — creates a Stripe Checkout session for the "Upgrade to Pro" flow. Uses the Stripe secret key (backend only, never exposed to the frontend).
- **frontend/src/pages/Upgrade.jsx** — triggers the Stripe Checkout redirect.
- **frontend/src/pages/PaymentSuccess.jsx** — shown after Stripe redirects back on a successful test payment.
- **frontend/src/pages/** — Login, Register, and Dashboard pages, each calling the backend via axios.
- **frontend/src/pages/ProtectedRoute.jsx** — redirects to `/login` if no token is found in localStorage.
