import assert from "node:assert/strict";
import process from "node:process";
import console from "node:console";
import { buildApp } from "../apps/app-server/dist/src/app.js";
import { loadConfig } from "../apps/app-server/dist/src/config.js";

// Use a disposable database: this check creates and removes a project.
assert.ok(process.env.DATABASE_URL, "DATABASE_URL must point to a disposable database");
const app = await buildApp(loadConfig({ ...process.env, LOG_LEVEL: "silent" }));
let id;
try {
  await app.ready();
  for (const url of ["/health/live", "/health/ready", "/documentation/json"]) {
    assert.equal((await app.inject({ url })).statusCode, 200, url);
  }
  const live = await app.inject({ url: "/health/live" });
  assert.deepEqual(live.json(), { code: 200, message: "ok", data: { status: "ok" } });

  // Service-level validation error: HTTP 200 + numeric code;subCode 为保留字段,当前不赋值。
  const invalid = await app.inject({
    method: "POST",
    url: "/api/projects/",
    payload: { name: " " },
  });
  assert.equal(invalid.statusCode, 200);
  assert.equal(invalid.json().code, 400);
  assert.equal(invalid.json().subCode, undefined);

  // Protocol-level error (malformed JSON body): keeps the real HTTP status.
  const malformed = await app.inject({
    method: "POST",
    url: "/api/projects/",
    headers: { "content-type": "application/json" },
    payload: "{",
  });
  assert.equal(malformed.statusCode, 400);
  assert.equal(malformed.json().code, 400);
  assert.equal(malformed.json().subCode, undefined);

  // Success: always HTTP 200 + { code: 200, message, data }.
  const created = await app.inject({
    method: "POST",
    url: "/api/projects/",
    payload: { name: " Review project " },
  });
  assert.equal(created.statusCode, 200);
  assert.equal(created.json().code, 200);
  id = created.json().data.id;
  assert.equal(created.json().data.name, "Review project");
  assert.equal(typeof created.json().data.createdAt, "string");

  const fetched = await app.inject({ url: `/api/projects/${id}` });
  assert.equal(fetched.statusCode, 200);
  assert.equal(fetched.json().data.id, id);

  const list = await app.inject({ url: "/api/projects/?limit=100" });
  assert.equal(list.statusCode, 200);
  assert.ok(list.json().data.items.some((item) => item.id === id));

  const badLimit = await app.inject({ url: "/api/projects/?limit=101" });
  assert.equal(badLimit.statusCode, 200);
  assert.equal(badLimit.json().code, 400);
  assert.equal(badLimit.json().subCode, undefined);

  const emptyPatch = await app.inject({
    method: "PATCH",
    url: `/api/projects/${id}`,
    payload: {},
  });
  assert.equal(emptyPatch.statusCode, 200);
  assert.equal(emptyPatch.json().code, 400);

  const updated = await app.inject({
    method: "PATCH",
    url: `/api/projects/${id}`,
    payload: { name: "Updated" },
  });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json().data.name, "Updated");

  const removed = await app.inject({ method: "DELETE", url: `/api/projects/${id}` });
  assert.equal(removed.statusCode, 200);
  assert.equal(removed.json().code, 200);
  assert.equal(removed.json().data, null);

  // Domain NOT_FOUND: HTTP 200 + code 404。
  const missing = await app.inject({ url: `/api/projects/${id}` });
  assert.equal(missing.statusCode, 200);
  assert.equal(missing.json().code, 404);
  assert.equal(missing.json().subCode, undefined);
  id = undefined;

  // Unknown route: infrastructure error -> real HTTP 404.
  const unknownRoute = await app.inject({ url: "/missing" });
  assert.equal(unknownRoute.statusCode, 404);
  assert.equal(unknownRoute.json().code, 404);
  assert.equal(unknownRoute.json().subCode, undefined);

  console.log(
    "Smoke passed: envelope contract, health, OpenAPI, CRUD, validation, protocol errors, domain errors.",
  );
} finally {
  try {
    if (id) await app.inject({ method: "DELETE", url: `/api/projects/${id}` });
  } finally {
    await app.close();
  }
}
