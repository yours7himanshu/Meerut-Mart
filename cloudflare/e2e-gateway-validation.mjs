import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import worker from "./worker.js";

const BACKEND_PORT = 4000;
const BACKEND_ORIGIN = `http://127.0.0.1:${BACKEND_PORT}`;

describe("Incremental Migration Validation - Live Backend & Edge Gateway", () => {
  let backendProcess;

  before(async () => {
    // Check if backend is already running on port 4000
    try {
      const ping = await fetch(`${BACKEND_ORIGIN}/`);
      if (ping.status === 200) {
        // Backend already running, reuse it
        return;
      }
    } catch {
      // Backend not running, proceed to spawn
    }

    const backendDir = path.resolve(import.meta.dirname, "../backend");
    backendProcess = spawn(process.execPath, ["server.js"], {
      cwd: backendDir,
      stdio: "ignore",
    });

    // Wait until backend responds
    const startTime = Date.now();
    let ready = false;
    while (Date.now() - startTime < 15000) {
      try {
        const res = await fetch(`${BACKEND_ORIGIN}/`);
        if (res.status === 200) {
          ready = true;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    if (!ready) {
      if (backendProcess) backendProcess.kill();
      throw new Error("Backend failed to start within 15 seconds on port 4000");
    }
  });

  after(() => {
    if (backendProcess) {
      try {
        backendProcess.kill();
      } catch {}
    }
  });

  describe("Stage A: Public API Verification", () => {
    test("Direct backend responds with API working", async () => {
      const res = await fetch(`${BACKEND_ORIGIN}/`);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert.strictEqual(text, "API working");
    });

    test("Cloudflare Worker forwards GET / correctly with edge security headers", async () => {
      const req = new Request("https://gateway.example.com/", {
        method: "GET",
        headers: {
          Origin: "https://meerut-mart-frontend.pages.dev",
        },
      });

      const res = await worker.fetch(req, { BACKEND_ORIGIN });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("X-Content-Type-Options"), "nosniff");
      assert.strictEqual(res.headers.get("X-Frame-Options"), "SAMEORIGIN");
      assert.strictEqual(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://meerut-mart-frontend.pages.dev"
      );
      const text = await res.text();
      assert.strictEqual(text, "API working");
    });

    test("Cloudflare Worker forwards GET /api/product/list and returns valid product catalog", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "GET",
        headers: {
          Origin: "https://meerut-mart-frontend.pages.dev",
        },
      });

      const res = await worker.fetch(req, { BACKEND_ORIGIN });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.products));
      assert.ok(data.products.length > 0);
    });
  });

  describe("Stage B: Authentication & Cache Isolation", () => {
    test("Worker NEVER caches requests with Authorization header", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "GET",
        headers: {
          Origin: "https://meerut-mart-frontend.pages.dev",
          Authorization: "Bearer mock_jwt_token_for_user",
        },
      });

      const res = await worker.fetch(req, { BACKEND_ORIGIN });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get("X-Gateway-Cache"), "BYPASS");
    });

    test("Worker NEVER caches login endpoints and proxies credentials safely", async () => {
      const req = new Request("https://gateway.example.com/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://meerut-mart-frontend.pages.dev",
        },
        body: JSON.stringify({ email: "nonexistent_verify_999@test.com" }),
      });

      const res = await worker.fetch(req, { BACKEND_ORIGIN });
      // Invalid credentials yield 401 from backend
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.headers.get("X-Gateway-Cache"), "BYPASS");
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Invalid credentials");
    });
  });

  describe("Stage C: CORS Security & Cross-Origin Isolation", () => {
    test("Worker blocks preflight requests from unauthorized origins with 403", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "OPTIONS",
        headers: {
          Origin: "https://malicious-phishing-site.com",
        },
      });

      const res = await worker.fetch(req, { BACKEND_ORIGIN });
      assert.strictEqual(res.status, 403);
    });

    test("Worker permits preflight from Cloudflare Pages preview domains", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "OPTIONS",
        headers: {
          Origin: "https://branch-preview-123.meerut-mart-frontend.pages.dev",
        },
      });

      const res = await worker.fetch(req, { BACKEND_ORIGIN });
      assert.strictEqual(res.status, 204);
      assert.strictEqual(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://branch-preview-123.meerut-mart-frontend.pages.dev"
      );
      assert.strictEqual(res.headers.get("Access-Control-Allow-Credentials"), "true");
    });
  });
});
