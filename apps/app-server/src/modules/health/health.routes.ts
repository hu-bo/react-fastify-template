import { sql } from "../../../database/index.js";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { errorResponseSchema } from "../../shared/error.schema.js";
import { okEnvelope, success } from "../../shared/response.schema.js";

const healthStatusSchema = z.object({ status: z.literal("ok") });

// 探针约定:成功走统一信封(HTTP 200);readiness 失败(如数据库不可用)
// 属于基础设施错误,由全局 error handler 返回真实 HTTP 500,便于编排系统识别。
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();
  typed.get(
    "/health/live",
    {
      schema: {
        operationId: "getLiveness",
        tags: ["health"],
        response: { 200: okEnvelope(healthStatusSchema) },
      },
    },
    async () => success({ status: "ok" as const }),
  );
  typed.get(
    "/health/ready",
    {
      schema: {
        operationId: "getReadiness",
        tags: ["health"],
        response: { 200: okEnvelope(healthStatusSchema), 500: errorResponseSchema },
      },
    },
    async () => {
      await app.db.execute(sql`select 1`);
      return success({ status: "ok" as const });
    },
  );
}
