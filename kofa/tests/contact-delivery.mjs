import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const requestBody = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  company: "Analytical Engines",
  website: "https://example.test",
  reason: "General Inquiry",
  message: "I would like to discuss an early-stage healthcare investment.",
};

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, () => {
      server.off("error", reject);
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine local test port."));
        return;
      }
      resolve(address.port);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reservePort() {
  const server = createServer();
  const port = await listen(server);
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function waitForRoute(origin, child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Next development server exited with ${child.exitCode}.`);
    }
    try {
      await fetch(`${origin}/api/contact`);
      return;
    } catch {
      await delay(250);
    }
  }
  throw new Error("Timed out waiting for the local contact route.");
}

async function postContact(origin, ip) {
  return fetch(`${origin}/api/contact`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(requestBody),
  });
}

const deliveries = [];
let mode = "success";
const mockDelivery = createServer(async (request, response) => {
  let rawBody = "";
  for await (const chunk of request) rawBody += chunk;
  deliveries.push({ method: request.method, body: JSON.parse(rawBody) });

  if (mode === "success") {
    response.writeHead(202).end();
  } else if (mode === "failure") {
    response.writeHead(503).end("Mock provider unavailable");
  }
  // The timeout mode deliberately keeps the local connection open. The route
  // must abort it and return 504; no external service is ever contacted.
});

const mockPort = await listen(mockDelivery);
const appPort = await reservePort();

const origin = `http://${host}:${appPort}`;
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const child = spawn(process.execPath, [nextBin, "dev", "-p", String(appPort)], {
  cwd: projectRoot,
  env: {
    ...process.env,
    KOFA_CONTACT_WEBHOOK: `http://${host}:${mockPort}/delivery`,
    // Explicitly prevent this test from using a real email provider, even if
    // the developer's shell or .env.local has credentials configured.
    RESEND_API_KEY: "",
    CONTACT_FROM_EMAIL: "",
    CONTACT_TO_EMAIL: "",
  },
  stdio: "ignore",
});

try {
  await waitForRoute(origin, child);

  let response = await postContact(origin, "198.51.100.1");
  assert.equal(response.status, 200, "a 2xx mock delivery should succeed");
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].method, "POST");
  assert.equal(deliveries[0].body.email, requestBody.email);

  mode = "failure";
  response = await postContact(origin, "198.51.100.2");
  assert.equal(response.status, 502, "a failed mock delivery should return 502");

  mode = "timeout";
  const started = Date.now();
  response = await postContact(origin, "198.51.100.3");
  const elapsed = Date.now() - started;
  assert.equal(response.status, 504, "a hung mock delivery should return 504");
  assert.ok(elapsed >= 7_000, `delivery timeout fired too early (${elapsed}ms)`);
  assert.ok(elapsed < 15_000, `delivery timeout took too long (${elapsed}ms)`);

  console.log("contact delivery mocks passed: success, failure, timeout");
} finally {
  child.kill("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5_000)]);
  await new Promise((resolve, reject) => mockDelivery.close((error) => error ? reject(error) : resolve()));
}
