import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

neonConfig.poolQueryViaFetch = true;

if (!process.env.POSTGRES_URL) {
  throw new Error("Environment variable POSTGRES_URL is not available.");
}

export const sql = neon(process.env.POSTGRES_URL);

export const db = drizzle(
  new Pool({ connectionString: process.env.POSTGRES_URL }),
  {
    schema,
    logger: true,
  },
);
