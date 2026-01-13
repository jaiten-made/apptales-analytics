import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "./relations";
import * as schema from "./schema";

const createDrizzle = () => {
  const client = postgres(process.env.DATABASE_URL!);
  return drizzle(client, { schema: { ...schema, ...relations } });
};

type DrizzleDB = ReturnType<typeof createDrizzle>;

const globalForDrizzle = globalThis as unknown as { db?: DrizzleDB };

export const db = globalForDrizzle.db ?? createDrizzle();

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.db = db;
}
