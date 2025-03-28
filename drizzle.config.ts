import "./drizzle/envConfig";
import { defineConfig } from "drizzle-kit";

if (!process.env.POSTGRES_URL)
  throw new Error("Environment variable POSTGRES_URL is not available.");

export default defineConfig({
  strict: true,
  verbose: true,
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
});
