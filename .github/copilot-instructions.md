# Copilot / Agent Instructions for pathau-now 🔧

Goal: Help an AI agent become productive quickly in this repo by describing the architecture, conventions, workflows, common pitfalls, and concrete examples.

## Quick architecture summary
- Two-part monorepo:
  - backend/ — Express + TypeScript API (no build step in dev; runs via `ts-node` + `nodemon`).
  - frontend/ — Next.js (app router) frontend.
- Pattern: Controller → Service → Repository → Model. DTOs (Zod) validate incoming payloads in controllers.
- Auth: JWT-based: `POST /api/auth/login` returns a token. Protected routes require `Authorization: Bearer <token>` header; `authenticate` middleware attaches `req.user`.
- File uploads: `multer` stores files in `uploads/` (created under project root at runtime).
- DB: MongoDB via Mongoose. If connection to configured Mongo fails, backend attempts an in-memory MongoDB (mongodb-memory-server) for local dev/testing.

## Key files to inspect for patterns
- backend/src/index.ts — server start, CORS config, route mounting
- backend/src/controllers/*.ts — controllers use `DTO.safeParse(req.body)` and return formatted JSON
- backend/src/dtos/*.dto.ts — Zod DTOs (use these to accept and validate input)
- backend/src/services/*.ts — business logic; throw `HttpError(status, message)` for expected errors
- backend/src/repositories/*.ts — data access (Mongoose models)
- backend/src/models/*.model.ts — Mongoose schemas & `IUser` type
- backend/src/middlewares/*.ts — `authenticate`, `isAdmin`, `upload` usage patterns
- frontend/app/(auth)/_components/apiClient.ts — how frontend calls the API (note default API URL)

## Environment & run instructions (source-of-truth)
- Backend quick start (backend/README.md):
  - Copy `.env.example` → `.env` with values: PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL
  - Install and run: `npm install` -> `npm run dev` (runs: `npx nodemon --exec ts-node src/index.ts`)
- Frontend: `npm run dev` in `frontend/` (Next.js dev server at :3000 by default).
- Shortcut: from the repo root you can run `npm run dev` to start both backend and frontend concurrently (requires root dev dependency `concurrently`).
  - Copy `frontend/.env.example` → `.env.local` and set `NEXT_PUBLIC_API_URL` if needed (default: `http://localhost:5000`).

## Important environment details & common pitfalls ⚠️
- Default backend `PORT` is 5000 (see backend README and `config/index.ts`).
- Frontend API client defaults to `http://localhost:5000` (see `frontend/app/(auth)/_components/apiClient.ts` and `frontend/lib/api/axios.ts`) — this must match the backend `PORT` (5000). Ensure `NEXT_PUBLIC_API_URL` is set to `http://localhost:5000` when running locally.
- CORS in backend is set to `http://localhost:3000` in `index.ts`. If your frontend uses another port, update CORS or set `FRONTEND_URL`.
- Uploads are stored at runtime in `uploads/` (created automatically). Be aware when running back-end in environments without writable filesystem.
- Database fallback: if `MONGO_URI` fails, an in-memory MongoDB will be started — useful for tests/dev but not for persisting data.

## Conventions & idioms to follow
- Validation: use Zod in DTOs. Controllers call `safeParse()` and return 400 with `parsedData.error.issues` on validation errors.
- Error handling: Services throw `HttpError(status, message)`; controllers catch and respond with `error.statusCode ?? 500`.
- Authentication: `authenticate` middleware expects `Authorization: Bearer <token>`. Use `req.user` to check identity/roles.
- File uploads: routes that accept `avatar` use `upload.single('avatar')`. The `createUserByAdmin` and update endpoints read `(req as any).file.filename`.
- When adding endpoints follow the folder separation: `routes` → `controllers` → `services` → `repositories`.

## Examples (copy/paste useful snippets)
- Login:
  - POST /api/auth/login
  - Body: { "email": "user@example.com", "password": "123456" }
  - Response: { success: true, message: "Login successful", data: user, token }
- Use token for protected endpoints:
  - Headers: `Authorization: Bearer <token>`
- Admin-only endpoints: routes under `/api/admin/users` require `authenticate` + `isAdmin` middlewares.

## Tasks an agent can do safely (and how)
- Add new REST endpoints: follow existing patterns — create route → controller → service → repository → tests (if available). Use DTOs for validation.
- Fix API base mismatch: update `frontend` to read `NEXT_PUBLIC_API_URL` (and document in README) or change backend port/config.
- Improve CORS handling by reading `process.env.FRONTEND_URL` (see backend/README.md suggestion).
- Add tests using mongodb-memory-server for isolated DB tests (the project already includes it in dependencies).

## What not to assume
- There are no unit tests in the repo by default — do not assume testing frameworks are present.
- Deployment build steps are only defined for frontend (Next.js). Backend has no production build or PM2/start script.

## Quick PR checklist for agents ✅
- Follow Controller→Service→Repository separation
- Use existing DTOs and `HttpError` for error flows
- Update README(s) when changing env vars or ports
- Make sure to keep CORS and `NEXT_PUBLIC_API_URL` consistent across frontend & backend

---
If you want, I can open a PR adding this file and/or update the frontend `NEXT_PUBLIC_API_URL` default to match the backend. Anything in this draft you'd like changed or expanded? ✨
