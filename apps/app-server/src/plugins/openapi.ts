import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export async function registerOpenApi(app: FastifyInstance, enableUi: boolean): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Projects API",
        version: "0.1.0",
        description: [
          "所有响应使用统一信封。成功与业务错误均返回 HTTP 200:",
          "成功 `{ code: 200, message, data }`;",
          "业务错误 `{ code: 400/404/409…, subCode?, message, requestId, details? }`(subCode 为保留字段,目前不赋值)。",
          "仅基础设施/协议错误(路由不存在 404、请求体畸形 400、内部崩溃 500 等)返回真实 HTTP 状态码,body 为同样的错误信封。",
        ].join("\n"),
      },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });
  if (enableUi) {
    await app.register(swaggerUi, { routePrefix: "/documentation" });
  }
}
