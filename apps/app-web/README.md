# 项目空间前端

React、Vite、TanStack Router 和 TanStack Query 构成的项目管理界面。页面使用 `apps/app-server` 的项目 API，支持查看、搜索、创建、重命名和删除项目。`temp-project` 仅作为布局与样式参考，应用不依赖其中的演示数据。

## 本地开发

在仓库根目录执行 `pnpm install`，然后运行 `pnpm dev:web`。浏览器打开 `http://127.0.0.1:5174`。Vite 将 `/api` 代理到 `http://127.0.0.1:3000`；要使用真实数据，还需配置数据库并启动后端。后端不可用时，页面会显示错误和重试操作。

可以在本目录的 `.env` 中设置 `API_PROXY_TARGET` 调整开发代理目标。`VITE_API_BASE_URL` 是浏览器公开的 API 地址，默认留空以使用同源 `/api`。

## 代码生成与验证

`orval.config.ts` 从 `../app-server/openapi.json` 生成 `src/api/generated/`。先运行根目录的 `pnpm openapi:export`，再运行 `pnpm --filter @react-fastify-template/app-web api:generate`。TanStack Router 的 `src/routeTree.gen.ts` 由 `pnpm --filter @react-fastify-template/app-web routes:generate` 生成；不要手动编辑生成文件。

根目录的 `pnpm check` 会执行 OpenAPI 导出、格式、lint、类型、构建和 API 生成结果检查。前端单独构建使用 `pnpm --filter @react-fastify-template/app-web build`。

项目列表 API 最多返回 100 项，页面中的数量与本月统计基于这批已加载数据，不代表数据库总量。侧栏搜索用于查找并打开前端菜单项，也可按 `Ctrl/⌘+K` 打开。
