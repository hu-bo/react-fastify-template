import { z } from "zod";

export const errorResponseSchema = z.object({
  /** 数字错误码(400/401/404/409/500…);业务错误经 HTTP 200 返回,基础设施错误时与真实 HTTP 状态码一致 */
  code: z.number().int(),
  /** 字符串业务码,供前端精确分支(如 NOT_FOUND / CONFLICT / VALIDATION_ERROR / ROUTE_NOT_FOUND / INTERNAL_ERROR) */
  subCode: z.string().optional(),
  message: z.string(),
  requestId: z.string(),
  details: z.record(z.unknown()).optional(),
});
