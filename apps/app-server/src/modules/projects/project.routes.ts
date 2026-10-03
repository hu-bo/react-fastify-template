import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { ProjectService } from "./project.service.js";
import {
  createProjectBodySchema,
  errorResponseSchema,
  okEnvelope,
  paginationQuerySchema,
  projectListSchema,
  projectParamsSchema,
  projectSchema,
  success,
  updateProjectBodySchema,
} from "./project.schema.js";

const responseProject = (project: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...project,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
});

// 统一信封:成功与业务错误都返回 HTTP 200,基础设施错误(如内部崩溃)返回真实状态码,
// 因此每条路由只声明 200(成功信封)与 500(错误信封);业务错误形状见 shared/error.schema.ts。
export async function projectRoutes(app: FastifyInstance, service: ProjectService): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();
  typed.get(
    "/",
    {
      schema: {
        operationId: "listProjects",
        tags: ["projects"],
        querystring: paginationQuerySchema,
        response: { 200: okEnvelope(projectListSchema), 500: errorResponseSchema },
      },
    },
    async (request) =>
      success({ items: (await service.list(request.query.limit)).map(responseProject) }),
  );
  typed.post(
    "/",
    {
      schema: {
        operationId: "createProject",
        tags: ["projects"],
        body: createProjectBodySchema,
        response: { 200: okEnvelope(projectSchema), 500: errorResponseSchema },
      },
    },
    async (request) => success(responseProject(await service.create(request.body))),
  );
  typed.get(
    "/:id",
    {
      schema: {
        operationId: "getProject",
        tags: ["projects"],
        params: projectParamsSchema,
        response: { 200: okEnvelope(projectSchema), 500: errorResponseSchema },
      },
    },
    async (request) => success(responseProject(await service.get(request.params.id))),
  );
  typed.patch(
    "/:id",
    {
      schema: {
        operationId: "updateProject",
        tags: ["projects"],
        params: projectParamsSchema,
        body: updateProjectBodySchema,
        response: { 200: okEnvelope(projectSchema), 500: errorResponseSchema },
      },
    },
    async (request) =>
      success(responseProject(await service.update(request.params.id, request.body))),
  );
  typed.delete(
    "/:id",
    {
      schema: {
        operationId: "deleteProject",
        tags: ["projects"],
        params: projectParamsSchema,
        response: { 200: okEnvelope(z.null()), 500: errorResponseSchema },
      },
    },
    async (request) => {
      await service.delete(request.params.id);
      return success(null);
    },
  );
}
