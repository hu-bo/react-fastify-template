import type { Database } from "@react-fastify-template/database";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}
