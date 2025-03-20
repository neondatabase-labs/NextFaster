import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

neonConfig.poolQueryViaFetch = true;

const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle({ client: sql, schema });
