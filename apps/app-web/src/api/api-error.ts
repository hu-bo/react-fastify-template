export class ApiError extends Error {
  constructor(
    /**
     * 数字错误码,与后端统一信封的 code 对齐:
     * - 业务错误:HTTP 200 + 信封 code(400/404/409…),此处为信封 code;
     * - 基础设施错误:真实 HTTP 状态码(404/500…);
     * - 网络失败:0。
     */
    public readonly status: number,
    /**
     * 错误来源标识(前端自行生成的字符串常量,如 NETWORK_ERROR / HTTP_ERROR /
     * INVALID_RESPONSE / UNKNOWN);后端信封的 subCode 为保留字段,当前不向 ApiError.code 透传。
     */
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '操作暂时未能完成，请稍后重试。';
}
