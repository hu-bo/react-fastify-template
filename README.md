# React Fastify Template

A pnpm workspace containing a Fastify API and Drizzle/PostgreSQL persistence package.

## Requirements

Node.js 20+ and Corepack-enabled pnpm. Copy `.env.example` to `.env`; `dotenv/config`
is loaded by the API server. The same `DATABASE_URL` is used by the API and Drizzle.

```sh
corepack enable
pnpm install
pnpm compose:up
pnpm db:migrate
pnpm dev
```

The API listens on `http://localhost:3000`. Liveness and readiness endpoints are
`/health/live` and `/health/ready`; Swagger UI is at `/documentation`.

Projects are available at `/api/projects/` with list, create, get, patch, and delete
operations. Use `pnpm build` before `pnpm start` for a production-style launch.

## OpenAPI

The contract is produced from the registered Fastify routes, without a database
connection:

```sh
pnpm openapi:export
pnpm --filter @react-fastify-template/api openapi:export ../web/openapi.json
```

The default output is `apps/api/openapi.json`. An optional path is resolved relative
to the API package unless it is absolute.
