import { z } from "zod";

/**
 * 统一响应信封约定:
 * - 业务成功:HTTP 200 + { code: 200, message, data }
 * - 业务失败(DomainError、参数校验失败):HTTP 200 + { code: <数字错误码>, message, requestId }
 * - 基础设施/协议错误(路由不存在、内部崩溃、请求体畸形等):真实 HTTP 状态码 + 同上的错误信封
 *
 * 数字 code 供网关/监控分类。错误信封中保留 subCode(number,可选)占位字段,留待未来细分错误类型。
 */
export function okEnvelope<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.literal(200),
    message: z.string(),
    data: dataSchema,
  });
}

export function success<T>(data: T): { code: 200; message: string; data: T } {
  return { code: 200, message: "ok", data };
}
