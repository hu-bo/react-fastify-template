# Repository Guide

The workspace contains `apps/api` (Fastify HTTP composition and features) and
`packages/database` (Drizzle schema, client factory, and generated migrations).
Features compose repositories and services locally; database types and SQL drivers
do not enter service APIs.

All API routes use Zod through `fastify-type-provider-zod`. Domain errors are HTTP
agnostic and are mapped by the root error plugin to the standard error envelope.
OpenAPI is generated from `buildApp`, so do not duplicate route definitions.

Use `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm db:generate`,
`pnpm db:migrate`, and `pnpm openapi:export`. Migrations are generated with
Drizzle and are never run automatically when the API starts.
