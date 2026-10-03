import { z } from 'zod';
import { ApiError } from './api-error';

// 后端统一信封约定(见 apps/app-server/src/shared/response.schema.ts):
// - 成功与业务错误都返回 HTTP 200:信封 code === 200 表示成功(业务数据在 data),
//   否则为业务错误 { code: 400/404/409…, subCode, message, requestId, details? };
// - 基础设施/协议错误(路由不存在、内部崩溃、网关等)才携带真实 HTTP 状态码,body 为同样的错误信封。
const envelopeSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  subCode: z.string().optional(),
  requestId: z.string().max(100).optional(),
  details: z.object({ field: z.string() }).optional(),
  data: z.unknown().optional(),
});
const messages: Record<string, string> = {
  NOT_FOUND: '这个项目不存在或已被删除。',
  CONFLICT: '项目名称已被使用，请换一个。',
  INVALID_INPUT: '请检查填写的内容后重试。',
  VALIDATION_ERROR: '请检查填写的内容后重试。',
  PAYLOAD_TOO_LARGE: '提交的内容过大，请精简后重试。',
  ROUTE_NOT_FOUND: '请求的接口不存在。',
  BAD_REQUEST: '请求无法处理，请刷新后重试。',
  INTERNAL_ERROR: '服务暂时不可用，请稍后重试。',
};
const FALLBACK = '服务暂时不可用，请稍后重试。';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { ...options, credentials: 'same-origin' });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(0, 'NETWORK_ERROR', '无法连接服务，请检查网络后重试。');
  }

  const parsed = envelopeSchema.safeParse(await response.json().catch(() => null));

  if (!response.ok) {
    // 基础设施错误:ApiError.status = 真实 HTTP 状态码,subCode 取自错误信封
    const envelope = parsed.success ? parsed.data : null;
    const subCode = envelope?.subCode ?? 'HTTP_ERROR';
    throw new ApiError(
      response.status,
      subCode,
      messages[subCode] ?? envelope?.message ?? FALLBACK,
      envelope?.requestId,
      envelope?.details?.field,
    );
  }
  if (!parsed.success) {
    // HTTP 200 但 body 不是合法信封(如被网关/代理劫持):按服务不可用处理,允许自动重试一次
    throw new ApiError(500, 'INVALID_RESPONSE', FALLBACK);
  }
  if (parsed.data.code !== 200) {
    // 服务内业务错误:HTTP 200 + 信封数字 code;ApiError.status 取信封 code,
    // 使既有的按 status 判断的逻辑(4xx 不重试、404 文案等)继续生效
    const subCode = parsed.data.subCode ?? 'UNKNOWN';
    throw new ApiError(
      parsed.data.code,
      subCode,
      messages[subCode] ?? parsed.data.message ?? FALLBACK,
      parsed.data.requestId,
      parsed.data.details?.field,
    );
  }
  // 成功:解包 data,组件层拿到的仍是业务数据本身
  return parsed.data.data as T;
}

export type ErrorType<Error> = ApiError & { readonly serverErrorType?: Error };
export type BodyType<Body> = Body;
