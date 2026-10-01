# React Fastify Template

Fastify + Zod + Drizzle/PostgreSQL 后端与 React 项目空间前端，使用 pnpm workspace。

## Structure

```text
apps/app-server/
  src/                  # app、server、plugins、modules、OpenAPI exporter
  database/             # client、schema、Drizzle config、migrations
apps/app-web/            # React 项目空间、路由、API client
deploy/compose.yaml     # 本地 PostgreSQL
```

## Getting Started

需要 Node.js 20+、pnpm 9 和 Docker。复制根目录 `.env.example` 为 `.env`；server 与 Drizzle 自动读取同一文件，已有环境变量优先。

```sh
pnpm install
pnpm compose:up
pnpm db:migrate
pnpm dev
```

API 默认地址为 http://localhost:3000，前端默认地址为 http://127.0.0.1:5174。liveness 为 `/health/live`，readiness 为 `/health/ready`，Swagger UI 为 `/documentation`。
正常启动先确认数据库可用；migration 单独执行。
`/api/projects/` 提供 list/create，`/api/projects/:id` 提供 get/patch/delete。
list 支持 limit（默认 20，最大 100）。运行 `pnpm build && pnpm start` 启动 `apps/app-server/dist/src/server.js`。前端可单独运行 `pnpm dev:web`，后端不可用时会显示错误与重试。

## Formatting and Checks

```sh
pnpm format
pnpm format:check
pnpm check
```

Prettier 统一人工代码与文档，跳过 lockfile、generated migration、OpenAPI、前端生成代码、参考项目和 dist。check 包含离线 OpenAPI 导出、格式、ESLint、类型、build 和前端 API 生成结果检查，不需要数据库。

## Database

本地 Compose 的 trust authentication 仅绑定 localhost。
指定指向临时数据库的 `DATABASE_URL` 后，可运行 `pnpm db:migrate` 和 `pnpm smoke`，
统一验证 health、OpenAPI、CRUD、输入校验和错误响应；smoke 创建并清理自己的 project。

`pnpm db:generate` 使用 apps/app-server/database/drizzle.config.ts，输出到 database/migrations。
`pnpm db:migrate` 使用相同配置执行 migration。

## OpenAPI

```sh
pnpm openapi:export
pnpm openapi:export ../web/openapi.json
```

默认输出 apps/app-server/openapi.json；相对参数基于 server package root。
源码和编译后的 exporter 使用同一路径规则。导出不依赖 .env 或数据库连接，供前端 Orval 使用。
