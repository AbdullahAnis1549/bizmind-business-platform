# BizMind AI

BizMind AI is a full-stack business management and analytics application for small and growing businesses. It brings customer, product, order, invoice, team, and business analytics workflows into one workspace, with optional AI-assisted insights and content generation.

## Features

- Business workspaces with owner, manager, and staff roles
- Customer, product, order, and invoice management
- Inventory tracking and order workflows
- Dashboard KPIs, charts, and detailed analytics
- AI assistant, business reports, and marketing content generation
- Optional AI provider integration, with a rule-based mode when no AI key is configured
- Email OTP verification for owner sign-in (optional) and required OTP verification for super-admin sign-in
- Notifications, global search, and an administration dashboard

## Tech stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, custom CSS, Recharts, and Axios
- **Backend:** Node.js (ES modules), Express, Mongoose, and MongoDB
- **Authentication and security:** JWT, bcrypt, Helmet, rate limiting, and request validation

## Requirements

- Node.js 18 or later
- MongoDB, either local or hosted

## Getting started

### 1. Configure the backend

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example` and set at least:

```env
PORT=7000
MONGODB_URI=mongodb://127.0.0.1:27017/bizmind_ai
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

The server refuses to start without `JWT_SECRET`. For the optional features, also configure:

- `AI_API_KEY` and optionally `AI_MODEL` to enable Gemini or OpenAI-backed AI responses. Without a key, supported AI features use the built-in rule-based mode.
- `ENABLE_OTP=true`, `SMTP_EMAIL`, and `SMTP_PASSWORD` to enable email OTP for owner login. Owner login does not require OTP by default.
- `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` to initialize the super-admin account. Super-admin login always uses email OTP, so configure SMTP for it.

### 2. (Optional) Load demo data

From the `server` directory, run:

```bash
npm run seed
```

**Warning:** The seed script deletes all documents in the application's user, business, customer, product, order, invoice, and notification collections before inserting its sample workspace. Use only with a disposable database. It refuses to run when `NODE_ENV=production` unless `ALLOW_SEED=true` is explicitly set.

The seeded demo accounts use the password `Password123!`:

| Role | Email |
| --- | --- |
| Owner | `owner@bizmind.ai` |
| Manager | `manager@bizmind.ai` |
| Staff | `staff@bizmind.ai` |

These are demo credentials, not production credentials. If owner OTP is enabled, the owner must also complete email verification.

### 3. Start the backend

From the `server` directory:

```bash
npm run dev
```

The API listens on `http://localhost:7000` by default.

### 4. Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:7000`. To use a separately hosted API, set `VITE_API_URL` in `client/.env` to the API base URL, including `/api` (see `client/.env.example`).

## Useful commands

Run these commands from the indicated directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run build` | Build the frontend for production |
| `client` | `npm run preview` | Preview the production frontend build |
| `server` | `npm run dev` | Start the backend with Node's watch mode |
| `server` | `npm start` | Start the backend |
| `server` | `npm run seed` | **Destructively** replace application data with demo data |

## Project layout

```text
.
├── client/       # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       └── services/
├── server/       # Express + MongoDB backend
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
└── README.md
```

The backend API is mounted under `/api`; available route groups include authentication, businesses, customers, products, orders, invoices, analytics, AI, team, notifications, search, and administration.

## License

No `LICENSE` file is currently included. Add a license before distributing or reusing this project.
