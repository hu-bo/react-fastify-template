export type DomainErrorCode = "NOT_FOUND" | "CONFLICT" | "VALIDATION_ERROR";

/** 字符串业务码 → 响应信封数字 code(语义对齐 HTTP 状态码,新增业务码时在此登记) */
const domainErrorCodes: Record<DomainErrorCode, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 400,
};

export function domainErrorStatusCode(code: DomainErrorCode): number {
  return domainErrorCodes[code] ?? 400;
}

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DomainError";
  }
}
