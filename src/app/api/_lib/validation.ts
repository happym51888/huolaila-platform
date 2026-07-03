import type { NextRequest } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export async function parseBody<T>(request: NextRequest, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    return {
      data: schema.parse(body),
      error: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error,
      };
    }

    throw error;
  }
}

export function parseQuery<T>(request: NextRequest, schema: ZodSchema<T>) {
  try {
    const values = Object.fromEntries(request.nextUrl.searchParams.entries());
    return {
      data: schema.parse(values),
      error: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error,
      };
    }

    throw error;
  }
}
