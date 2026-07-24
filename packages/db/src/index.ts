import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env.mjs";
import * as schema from "./schema";

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const globalForDb = globalThis as typeof globalThis & {
  __dbPool__?: Pool;
  __db__?: NodePgDatabase<typeof schema>;
};

function createPool() {
  return new Pool({
    connectionString,
    // Any ssl object makes pg require TLS; local dev Postgres has SSL disabled.
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false
  });
}

const dbPool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (globalForDb.__dbPool__ ??= createPool());

export const pool = dbPool;

export { schema };

// The Drizzle client — the single entry point for all data access.
export const db =
  process.env.NODE_ENV === "production"
    ? drizzle(dbPool, { schema })
    : (globalForDb.__db__ ??= drizzle(dbPool, { schema }));