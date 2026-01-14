import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import path from "path";
import postgres from "postgres";
import * as relations from "./relations";
import * as schema from "./schema";

// Load the environment variables from the specific file
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});

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
