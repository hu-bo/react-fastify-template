# Repository Guide

工程使用 pnpm workspace，后端位于 `apps/server`，数据库位于内部目录 `apps/server/database`，Compose 位于 `deploy/compose.yaml`。目前仅包含后端。

## Architecture

feature 在 src/modules 内组装 repository 与 service；业务层不依赖 Fastify。
Zod route contract 驱动 validation 和 OpenAPI；domain-error 由 root handler 映射。
OpenAPI 离线导出不连接数据库，正常启动先检查数据库。database 与 src 一起编译，入口为 dist/src/server.js。

## Commands

使用 `pnpm format` 格式化，`pnpm check` 检查格式、lint、类型、build 与 OpenAPI。
`pnpm db:generate` 生成 migration，`pnpm db:migrate` 显式执行；已发布 migration 不回写。
根目录 .env 由 server 和 Drizzle 共用，环境变量优先。

## Style
请使用 React 19 + TypeScript + Vite + Tailwind CSS 构建一个具备现代极简风格、高交互体验的企业级在线文档与团队知识库系统（参考 Notion、Linear、Slite 的产品审美与交互质感）。

### 一、 核心视觉风格与设计规范 (Design System & Aesthetic)
1. **排版与调色板**：
   - **字体层级**：正文使用高清晰度现代无衬线字体（Inter / 苹方 / 系统无衬线），代码与标签使用等宽字体（Fira Code / JetBrains Mono）。
   - **底色与基调**：浅色模式下采用细腻的 `bg-slate-50` / `bg-slate-100`，深色模式下采用深邃的 `bg-slate-900` / `bg-slate-950`；文字采用高对比度的 Slate 色阶（`text-slate-900` / `text-slate-100`），辅以 `text-slate-400` 次级说明。
   - **品牌主色**：精致的 Indigo/Violet 紫蓝色调（`#6366f1` / `indigo-600`），搭配柔和的半透明背景高光（如 `bg-indigo-50/50`）。
   - **边框与阴影**：极细微的分割线（`border-slate-200 dark:border-slate-800`），轻量级微阴影（`shadow-xs` / `shadow-2xs`），拒绝厚重的拟物化装饰。
   - **微交互与微动效**：按钮与卡片拥有丝滑的 Hover 缩放/颜色过渡、呼吸呼吸灯（Pulsing dot）、浮动工具条缩放淡入（zoom-in-95 + fade-in）。