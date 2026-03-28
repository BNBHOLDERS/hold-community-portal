/**
 * 自定义错误类
 * 统一应用错误处理
 */

/**
 * 应用错误基类
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // 标记为可预期的操作错误

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode
    };
  }
}

/**
 * 400 错误 - 请求参数错误
 */
class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * 401 错误 - 未认证
 */
class UnauthorizedError extends AppError {
  constructor(message = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 错误 - 禁止访问
 */
class ForbiddenError extends AppError {
  constructor(message = '无权限访问') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 错误 - 资源不存在
 */
class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * 409 错误 - 资源冲突
 */
class ConflictError extends AppError {
  constructor(message = '资源冲突') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 422 错误 - 验证失败
 */
class ValidationError extends AppError {
  constructor(message = '数据验证失败') {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

/**
 * 429 错误 - 请求过多
 */
class RateLimitError extends AppError {
  constructor(message = '请求过于频繁') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * 500 错误 - 服务器内部错误
 */
class InternalServerError extends AppError {
  constructor(message = '服务器内部错误') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

/**
 * 503 错误 - 服务不可用
 */
class ServiceUnavailableError extends AppError {
  constructor(message = '服务暂时不可用') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * 错误处理中间件工厂
 */
function errorHandler(options = {}) {
  const { logErrors = true } = options;

  return (err, req, res, next) => {
    // 记录错误
    if (logErrors) {
      console.error(`[${new Date().toISOString()}] Error:`, {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip
      });
    }

    // 判断是否为 AppError
    const isAppError = err instanceof AppError;

    const statusCode = isAppError ? err.statusCode : 500;
    const message = isAppError ? err.message : (process.env.NODE_ENV === 'production' ? '服务器错误' : err.message);
    const code = isAppError ? err.code : 'INTERNAL_ERROR';

    res.status(statusCode).json({
      error: message,
      ...(code && { code }),
      ...(process.env.NODE_ENV === 'development' && !isAppError && { stack: err.stack })
    });
  };
}

/**
 * 异步路由包装器 - 自动捕获 async 函数中的错误
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  errorHandler,
  asyncHandler
};
