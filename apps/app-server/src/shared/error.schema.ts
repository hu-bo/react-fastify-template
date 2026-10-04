import { z } from "zod";

export const errorResponseSchema = z.object({
  /** 数字错误码(400/401/404/409/500…);业务错误经 HTTP 200 返回,基础设施错误时与真实 HTTP 状态码一致 */
  code: z.number().int(),
  /** 保留字段:数字业务码占位,目前不赋值,留待未来细分错误类型 */
  subCode: z.number().int().optional(),
  message: z.string(),
  requestId: z.string(),
  details: z.record(z.unknown()).optional(),
});
