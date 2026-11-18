import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/server.js";

test("health endpoint returns service status", async () => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "ok");
  server.close();
});

