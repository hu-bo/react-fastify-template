import { createDatabase, createPool } from "@react-fastify-template/database";
import fp from "fastify-plugin";
import type { AppConfig } from "../config.js";

export const databasePlugin = fp(async (app, config: Pick<AppConfig, "DATABASE_URL" | "DATABASE_POOL_MAX" | "DATABASE_CONNECT_TIMEOUT_MS" | "DATABASE_QUERY_TIMEOUT_MS">) => {
  const pool = createPool({
    connectionString: config.DATABASE_URL,
    max: config.DATABASE_POOL_MAX,
    connectionTimeoutMillis: config.DATABASE_CONNECT_TIMEOUT_MS,
    query_timeout: config.DATABASE_QUERY_TIMEOUT_MS,
  });

  app.decorate("db", createDatabase(pool));
  app.addHook("onClose", async () => {
    await pool.end();
  });
}, { name: "database" });
