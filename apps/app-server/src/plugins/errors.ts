import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";
import { DomainError, domainErrorStatusCode } from "../shared/domain-error.js";

/**
 * 错误分层约定(与 shared/response.schema.ts 的统一信封配套):
 * - 服务内错误(DomainError、Zod 校验失败):HTTP 200 + { code: <数字>, subCode, message, requestId }
 * - 基础设施/协议错误(路由不存在、请求体畸形、内部崩溃):真实 HTTP 状态码 + 同样的错误信封
 *
 * 注意:路由按 200 编译的是"成功信封"的 Zod 序列化器,直接以 200 发送错误信封会被
 * 序列化校验拒绝(退化为 500),因此这里统一用 reply.serializer(JSON.stringify)
 * 绕过路由默认序列化器;信封只在 sendError 一处构造,形状由 smoke 脚本断言兜底。
 */

// 基础设施 4xx 的 subCode 归一化:FST_* 等框架原始码只进日志,前端只见稳定业务码
const INFRA_SUBCODES: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "ROUTE_NOT_FOUND",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  429: "TOO_MANY_REQUESTS",
};

function sendError(
  reply: FastifyReply,
  request: FastifyRequest,
  httpStatus: number,
  code: number,
  subCode: string,
  message: string,
  details?: Record<string, unknown>,
): FastifyReply {
  return reply
    .code(httpStatus)
    .header("cache-control", "no-store")
    .serializer((payload) => JSON.stringify(payload))
    .send({ code, subCode, message, requestId: request.id, ...(details ? { details } : {}) });
}

export function registerErrorHandlers(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) =>
    sendError(reply, request, 404, 404, "ROUTE_NOT_FOUND", "Route not found"),
  );
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof DomainError) {
      request.log.warn({ subCode: error.code }, "Domain error");
      return sendError(
        reply,
        request,
        200,
        domainErrorStatusCode(error.code),
        error.code,
        error.message,
        error.details,
      );
    }
    if (hasZodFastifySchemaValidationErrors(error)) {
      request.log.warn("Request validation failed");
      return sendError(reply, request, 200, 400, "VALIDATION_ERROR", "Request validation failed");
    }
    if (isResponseSerializationError(error)) {
      request.log.error(error, "Response serialization failed");
      return sendError(reply, request, 500, 500, "INTERNAL_ERROR", "Internal server error");
    }
    const fastifyError = error as FastifyError;
    const status =
      fastifyError.statusCode && fastifyError.statusCode >= 400 && fastifyError.statusCode < 500
        ? fastifyError.statusCode
        : 500;
    request.log.error(error, "Unhandled request error");
    return sendError(
      reply,
      request,
      status,
      status,
      status === 500 ? "INTERNAL_ERROR" : (INFRA_SUBCODES[status] ?? "BAD_REQUEST"),
      status === 500 ? "Internal server error" : "Request could not be processed",
    );
  });
}
