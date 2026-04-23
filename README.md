# GENDERIZE-API

This project implements a Queryable Intelligence Engine exposing profiles with advanced filtering, sorting, pagination and a rule-based natural language search.

Quick start:

1. Create a `.env` with `MONGO_URI` pointing to your MongoDB instance.
2. Place the provided 2026 profiles JSON file at `src/data/profiles_2026.json`.
3. Install deps:

```bash
npm install
```

4. Seed the DB:

```bash
npm run seed
```

5. Start the server:

```bash
npm start
```

Endpoints:
- `GET /api/profiles` — advanced filtering, sorting, pagination.
- `GET /api/profiles/search?q=...` — rule-based natural language parsing into filters.

Responses follow the exact JSON structures required by the assignment. All timestamps are UTC ISO-8601. CORS is enabled for all origins.

If you don't have the provided profiles file, generate a synthetic placeholder with:

```bash
npm run generate
```

This creates `src/data/profiles_2026.json` (2026 mock profiles) which the seeder will upsert safely.
