import "server-only";
import { parseEnv } from "@neon/env";
import config from "@/neon";

export const env = parseEnv(config, ["DATABASE_URL", "NEON_AUTH_BASE_URL"]);
