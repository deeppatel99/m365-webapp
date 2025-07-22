# Forsynse MVP – Unified Full Stack App

This project is a full-stack application with a Node.js/Express backend and a React (TypeScript) frontend, now merged into a single, maintainable codebase.

## Folder Structure

- `server.js` — Backend entry point
- `controllers/` — Backend controllers
- `services/` — Backend business logic
- `models/` — Backend data models (CSV-based)
- `routes/` — Backend API routes
- `middlewares/` — Backend middleware (validation, rate limiting)
- `utils/` — Shared backend utilities
- `data/` — CSV data files
- `config/` — Configuration files
- `validations/` — Joi validation schemas
- `src/` — React frontend source code
- `public/` — React static assets

## Getting Started

### 1. Install dependencies

From the root directory, run:

```
npm install
```

### 2. Start the app (both backend and frontend)

```
npm start
```

- This will start both the backend (on http://localhost:5000) and the frontend (on http://localhost:3000) concurrently.

### 3. Development scripts

- `npm run start:backend` — Start backend only
- `npm run start:frontend` — Start frontend only

## Environment Variables

- Copy `.env.example` to `.env` and fill in your SMTP and other required values for backend email/OTP features.

## Notes

- All backend and frontend code is now in a single codebase for easy management.
- Backend uses CSV files for data storage (see `data/` folder).
- Frontend uses React with TypeScript and Material UI.
- All API calls from the frontend are proxied to the backend using the `proxy` field in `package.json`.
- Code is commented and organized for clarity and maintainability.

## Best Practices

- Keep backend and frontend logic modular and separated by folder.
- Use the provided scripts for development and deployment.
- Add shared code (e.g., types, utils) in a `shared/` folder if needed in the future.

---

For any questions, contact the project maintainer.
