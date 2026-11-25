# MoneyMap (full stack)

Retro desktop-style personal finance manager.

- `frontend/`: React + TypeScript + Vite + Tailwind
- `backend/`: Java 17+ Spring Boot 3 (REST API, JWT login) + PostgreSQL

## Run it

1. **Database** (Docker): `docker compose up -d`
   Or use your own PostgreSQL and create a database called `moneymap`.
2. **Backend**: `cd backend && mvn spring-boot:run` (http://localhost:8080)
3. **Frontend**: `cd frontend && npm install && npm run dev` (http://localhost:5173)

Open the app, click "Create an account", and you start with an empty money map.

## Configuration (environment variables, all optional in development)

| Variable | Default |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/moneymap` |
| `DB_USER` / `DB_PASSWORD` | `postgres` / `postgres` |
| `JWT_SECRET` | dev-only value, **set your own (32+ chars) in production** |
| `CORS_ORIGINS` | `http://localhost:5173` |

For a production frontend build served from another origin, set `VITE_API_URL` (see `frontend/.env.example`).

## API

Public: `POST /api/auth/signup`, `POST /api/auth/login`.
Everything else needs `Authorization: Bearer <token>` and only ever touches the logged-in user's rows:
`GET /api/auth/me`, `GET|DELETE /api/data`, `GET|PUT /api/settings`,
`/api/transactions`, `/api/budgets`, `/api/goals` (+ `POST /{id}/contribute`),
`/api/subscriptions` (+ `POST /{id}/toggle`, `POST /{id}/pay`), each with GET, POST, PUT `/{id}`, DELETE `/{id}`.

Tables are created automatically on first start (`ddl-auto: update`).
