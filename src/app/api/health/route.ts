import { db } from "@/lib/db";
import { json } from "@/app/api/_lib/response";

export async function GET() {
  await db.$queryRaw`SELECT 1`;

  return json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
}
