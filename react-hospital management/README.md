# PulseCare Admin (Frontend)

Minimal Vite + React admin UI for the PulseCare hospital management system.

Quick start (Windows PowerShell)

```powershell
# 1) Open two terminals
# Terminal A: start backend
cd "..\hospital-api"; npm install; npm run dev

# Terminal B: start frontend
cd "react-hospital management"; npm install; npm run dev
```

Environment
- Frontend reads the backend base URL from `VITE_API_BASE_URL` (create `.env` at the frontend root if needed).
- Backend requires `MONGO_URI` and `JWT_SECRET` in `hospital-api/.env`.

Defaults used in examples: `http://localhost:5000/api/v1` for the backend API base URL.

Notes
- Do NOT commit your `.env` files. Keep `hospital-api/.env.example` in the repo to show required keys.
- If you want a faster UI polish, I can add CSS and icons to the dashboard cards next.
