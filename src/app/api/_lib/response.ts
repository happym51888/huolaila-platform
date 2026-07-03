import { NextResponse } from "next/server";

export function json<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonList<T>(
  data: T[],
  meta: {
    total: number;
    page: number;
    pageSize: number;
  },
) {
  return NextResponse.json({ data, meta });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}
