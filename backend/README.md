

Backend development and frontend integration
===========================================

Quick start
-----------

- Copy `.env.example` to `.env` and update values (PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL).
- Install dependencies and start the dev server:

```bash
cd "d:/developer api/New folder/backend"
npm install
npm run dev
```

Default values
--------------
- The backend defaults to `PORT=5000` when `.env` is not present.
- `FRONTEND_URL` is used by CORS; set it to your frontend dev server (e.g. `http://localhost:3000`).

Note: If you change `PORT` (or a `.env` sets it, e.g. `PORT=5050`), make sure the frontend's `NEXT_PUBLIC_API_URL` (in `frontend/.env.local`) matches the backend URL (for example `http://localhost:5050`).

Connecting the frontend
-----------------------
You must either add the frontend folder to this VS Code workspace or configure the frontend repo to call the backend API at its URL.

Common frontend setups:

- Create React App (CRA):
	- Option 1 (dev proxy): in frontend `package.json` add:

		```json
		"proxy": "http://localhost:5000"
		```

		Then API requests to `/api/...` are proxied to the backend during development.

	- Option 2 (env variable): create `.env` in the frontend with:

		```env
		REACT_APP_API_URL=http://localhost:5000
		```

		Use `process.env.REACT_APP_API_URL` in your fetch/axios calls.

- Vite:

	- Use `.env` with `VITE_API_URL=http://localhost:5000` and read via `import.meta.env.VITE_API_URL`.

If you prefer, add the frontend folder to this workspace and tell me its path; I can patch the frontend to use `http://localhost:5000` automatically (proxy or env).

Security note
-------------
The server currently allows CORS from `process.env.FRONTEND_URL || '*'` for developer convenience. For production, set `FRONTEND_URL` to the exact origin and restrict CORS accordingly.

Next steps I can do for you
--------------------------
- Update the frontend (if you add it to the workspace) to use a proxy or env variable.
- Change backend port or tighten CORS rules.
- Run tests or attempt a local connection check (requires frontend folder accessible).

