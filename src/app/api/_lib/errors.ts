import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

export function validationError(error: ZodError) {
  return errorResponse(
    "VALIDATION_ERROR",
    "请求参数不合",
    400,
    error.issues.map((item) => ({
      field: item.path.join("."),
      message: item.message,
    })),
  );
}

export function notFound(resource: string) {
  return errorResponse("NOT_FOUND", `${resource} 不存在`, 404);
}

export function unauthorized(message = "未登录或登录已失") {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "没有权限执行该操") {
  return errorResponse("FORBIDDEN", message, 403);
}

export function conflict(message: string) {
  return errorResponse("CONFLICT", message, 409);
}

export function internalError(message = "服务器开小差了，请稍后重") {
  return errorResponse("INTERNAL_ERROR", message, 500);
}
