# TEOTIA & CO. — Blog CMS API

Express + TypeScript backend for the TEOTIA & CO. blog CMS.

## Phase status

- **Phase 1:** Foundation (health, middleware, utilities) — complete
- **Phase 2+:** See [../plan.md](../plan.md)

## Requirements

- Node.js 20+
- MySQL **8.0.46** (local)

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_*, JWT_SECRET, COOKIE_SECRET (min 16 chars), BASE_URL
```

Create the database:

```sql
CREATE DATABASE teotia_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with ts-node-dev |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run lint` | ESLint |

## Health check

```http
GET /health
```

**200** when MySQL is reachable:

```json
{
  "success": true,
  "message": "Health check",
  "data": {
    "status": "ok",
    "timestamp": "...",
    "uptime": 1.2,
    "database": "up"
  }
}
```

**503** if MySQL ping fails (`database: "down"`).

Set `SKIP_DB_CHECK=true` only for local work without MySQL (health skips DB; startup still connects unless skip is set in server — actually server also skips test when SKIP_DB_CHECK).

## Folder structure

```
src/
├── config/       env, database, aws, mail
├── constants/
├── controllers/
├── middlewares/
├── routes/
├── services/     (Phase 2+)
├── repositories/ (Phase 2+)
├── validators/   (Phase 2+)
├── utils/
├── app.ts
└── server.ts
```

## API response format

Success: `{ "success": true, "message": "", "data": {} }`  
Failure: `{ "success": false, "message": "", "errors": [] }`

## Environment variables

See [.env.example](./.env.example).

## Same-origin (Phase 7)

Production: reverse proxy `/api` → this server. Dev: Next.js rewrites to `http://127.0.0.1:5000`.
