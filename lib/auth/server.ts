import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { env } from "@/lib/env";

export const auth = createNeonAuth({
  baseUrl: env.auth.baseUrl,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
