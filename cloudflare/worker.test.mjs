import { test, describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import worker, {
  isAllowedOrigin,
  isCacheableRequest,
  isCacheableResponse,
} from "./worker.js";

describe("Cloudflare Worker - Security & Routing Test Suite", () => {
  let mockServer;
  let mockServerUrl;
  let lastUpstreamRequest = null;

  before(async () => {
    mockServer = http.createServer(async (req, res) => {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }

      lastUpstreamRequest = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body,
      };

      if (req.url === "/api/product/list") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        });
        res.end(JSON.stringify({ success: true, products: [{ id: "p1", name: "Shirt" }] }));
        return;
      }

      if (req.url === "/api/user/login") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": "session=secret_token; HttpOnly; Path=/",
        });
        res.end(JSON.stringify({ success: true, token: "jwt_token_123" }));
        return;
      }

      if (req.url.startsWith("/api/order/place")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "Order Placed Successfully" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Default response" }));
    });

    await new Promise((resolve) => {
      mockServer.listen(0, "127.0.0.1", () => {
        const port = mockServer.address().port;
        mockServerUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    mockServer.close();
  });

  describe("1. CORS Origin Whitelist Validation", () => {
    it("should allow verified frontend localhost origins", () => {
      assert.strictEqual(isAllowedOrigin("http://localhost:5173"), true);
      assert.strictEqual(isAllowedOrigin("http://localhost:5174"), true);
      assert.strictEqual(isAllowedOrigin("http://127.0.0.1:5173"), true);
    });

    it("should allow verified Vercel production origins", () => {
      assert.strictEqual(
        isAllowedOrigin("https://meerut-mart-application.vercel.app"),
        true
      );
      assert.strictEqual(
        isAllowedOrigin("https://meerut-mart-admin.vercel.app"),
        true
      );
    });

    it("should allow any Cloudflare Pages *.pages.dev domain", () => {
      assert.strictEqual(
        isAllowedOrigin("https://meerut-mart-frontend.pages.dev"),
        true
      );
      assert.strictEqual(
        isAllowedOrigin("https://staging-preview.meerut-mart.pages.dev"),
        true
      );
      assert.strictEqual(
        isAllowedOrigin("https://abc-123-deploy.pages.dev"),
        true
      );
    });

    it("should allow custom origins configured via env.ALLOWED_ORIGINS", () => {
      const env = { ALLOWED_ORIGINS: "https://shop.meerutmart.com, https://admin.meerutmart.com" };
      assert.strictEqual(isAllowedOrigin("https://shop.meerutmart.com", env), true);
      assert.strictEqual(isAllowedOrigin("https://admin.meerutmart.com", env), true);
    });

    it("should reject malicious or unlisted origins", () => {
      assert.strictEqual(isAllowedOrigin("https://malicious-site.com"), false);
      assert.strictEqual(isAllowedOrigin("http://evil.attacker.org"), false);
      assert.strictEqual(isAllowedOrigin("https://pages.dev.attacker.com"), false);
      assert.strictEqual(isAllowedOrigin(""), false);
      assert.strictEqual(isAllowedOrigin(null), false);
    });
  });

  describe("2. Cache Isolation & Privacy Rules", () => {
    it("should allow caching for unauthenticated public catalog GET endpoints", () => {
      const reqList = new Request("https://api.meerutmart.com/api/product/list", { method: "GET" });
      assert.strictEqual(isCacheableRequest(reqList, new URL(reqList.url)), true);

      const reqDisplay = new Request("https://api.meerutmart.com/api/displayproduct", { method: "GET" });
      assert.strictEqual(isCacheableRequest(reqDisplay, new URL(reqDisplay.url)), true);

      const reqReviews = new Request("https://api.meerutmart.com/api/product/64f123abc/reviews", { method: "GET" });
      assert.strictEqual(isCacheableRequest(reqReviews, new URL(reqReviews.url)), true);
    });

    it("should NEVER cache requests carrying Authorization header", () => {
      const req = new Request("https://api.meerutmart.com/api/product/list", {
        method: "GET",
        headers: { Authorization: "Bearer eyJhbGciOiJIUzI1Ni..." },
      });
      assert.strictEqual(isCacheableRequest(req, new URL(req.url)), false);
    });

    it("should NEVER cache requests carrying token header", () => {
      const req = new Request("https://api.meerutmart.com/api/product/list", {
        method: "GET",
        headers: { token: "secret-token-123" },
      });
      assert.strictEqual(isCacheableRequest(req, new URL(req.url)), false);
    });

    it("should NEVER cache requests carrying Cookie header", () => {
      const req = new Request("https://api.meerutmart.com/api/product/list", {
        method: "GET",
        headers: { Cookie: "session=xyz987" },
      });
      assert.strictEqual(isCacheableRequest(req, new URL(req.url)), false);
    });

    it("should NEVER cache POST, PUT, DELETE, or PATCH methods", () => {
      const postReq = new Request("https://api.meerutmart.com/api/product/list", { method: "POST" });
      assert.strictEqual(isCacheableRequest(postReq, new URL(postReq.url)), false);

      const deleteReq = new Request("https://api.meerutmart.com/api/product/remove", { method: "DELETE" });
      assert.strictEqual(isCacheableRequest(deleteReq, new URL(deleteReq.url)), false);
    });

    it("should NEVER cache private or transactional endpoints", () => {
      const privateRoutes = [
        "/api/user/login",
        "/api/user/register",
        "/api/cart/get",
        "/api/cart/add",
        "/api/order/place",
        "/api/order/userorders",
        "/api/order/list",
        "/api/become-seller",
        "/api/sell-item",
        "/send-email",
      ];

      for (const route of privateRoutes) {
        const req = new Request(`https://api.meerutmart.com${route}`, { method: "GET" });
        assert.strictEqual(
          isCacheableRequest(req, new URL(req.url)),
          false,
          `Route ${route} must not be cacheable`
        );
      }
    });

    it("should reject caching responses with Set-Cookie or no-store directives", () => {
      const resWithCookie = new Response("{}", {
        status: 200,
        headers: { "Set-Cookie": "session=abc; HttpOnly" },
      });
      assert.strictEqual(isCacheableResponse(resWithCookie), false);

      const resNoStore = new Response("{}", {
        status: 200,
        headers: { "Cache-Control": "no-store, private" },
      });
      assert.strictEqual(isCacheableResponse(resNoStore), false);

      const resError = new Response("{}", { status: 500 });
      assert.strictEqual(isCacheableResponse(resError), false);

      const resClean = new Response("{}", {
        status: 200,
        headers: { "Cache-Control": "public, max-age=60" },
      });
      assert.strictEqual(isCacheableResponse(resClean), true);
    });
  });

  describe("3. Upstream Request Forwarding & Proxy Integrity", () => {
    it("should forward GET requests with query parameters correctly", async () => {
      const req = new Request("https://gateway.example.com/api/product/list?category=men&sort=asc", {
        method: "GET",
        headers: {
          Origin: "https://meerut-mart-frontend.pages.dev",
        },
      });

      const env = { BACKEND_ORIGIN: mockServerUrl };
      const res = await worker.fetch(req, env);
      assert.strictEqual(res.status, 200);

      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(lastUpstreamRequest.url, "/api/product/list?category=men&sort=asc");
      assert.strictEqual(lastUpstreamRequest.method, "GET");
    });

    it("should forward POST request body and authentication headers intact", async () => {
      const payload = JSON.stringify({ email: "user@example.com", password: "Password123!" });
      const req = new Request("https://gateway.example.com/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://meerut-mart-frontend.pages.dev",
          Authorization: "Bearer mock_jwt_token",
          token: "custom_admin_token",
        },
        body: payload,
      });

      const env = { BACKEND_ORIGIN: mockServerUrl };
      const res = await worker.fetch(req, env);
      assert.strictEqual(res.status, 200);

      assert.strictEqual(lastUpstreamRequest.method, "POST");
      assert.strictEqual(lastUpstreamRequest.url, "/api/user/login");
      assert.strictEqual(lastUpstreamRequest.body, payload);
      assert.strictEqual(lastUpstreamRequest.headers["authorization"], "Bearer mock_jwt_token");
      assert.strictEqual(lastUpstreamRequest.headers["token"], "custom_admin_token");
      assert.strictEqual(lastUpstreamRequest.headers["content-type"], "application/json");
      assert.strictEqual(res.headers.get("X-Gateway-Cache"), "BYPASS");
    });

    it("should forward client IP and host metadata headers", async () => {
      const req = new Request("https://gateway.example.com/api/order/place", {
        method: "POST",
        headers: {
          "CF-Connecting-IP": "203.0.113.195",
        },
      });

      const env = { BACKEND_ORIGIN: mockServerUrl };
      await worker.fetch(req, env);

      assert.strictEqual(lastUpstreamRequest.headers["cf-connecting-ip"], "203.0.113.195");
      assert.strictEqual(lastUpstreamRequest.headers["x-forwarded-for"], "203.0.113.195");
      assert.strictEqual(lastUpstreamRequest.headers["x-forwarded-proto"], "https");
      assert.strictEqual(lastUpstreamRequest.headers["x-forwarded-host"], "gateway.example.com");
    });
  });

  describe("4. Security & Error Handling", () => {
    it("should return 204 with CORS headers for approved OPTIONS preflight", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "OPTIONS",
        headers: {
          Origin: "https://meerut-mart-frontend.pages.dev",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, Authorization",
        },
      });

      const res = await worker.fetch(req, {});
      assert.strictEqual(res.status, 204);
      assert.strictEqual(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://meerut-mart-frontend.pages.dev"
      );
      assert.strictEqual(res.headers.get("Access-Control-Allow-Credentials"), "true");
      assert.ok(res.headers.get("Access-Control-Allow-Headers").includes("Authorization"));
      assert.ok(res.headers.get("Access-Control-Allow-Headers").includes("token"));
    });

    it("should return 403 Forbidden for unauthorized CORS preflight origin", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "OPTIONS",
        headers: {
          Origin: "https://attacker.evil.com",
          "Access-Control-Request-Method": "GET",
        },
      });

      const res = await worker.fetch(req, {});
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.ok(data.error.includes("forbidden"));
    });

    it("should sanitize error output when upstream fails (502 Bad Gateway)", async () => {
      const req = new Request("https://gateway.example.com/api/product/list", {
        method: "GET",
      });

      const env = { BACKEND_ORIGIN: "http://127.0.0.1:59999" }; // unused port
      const res = await worker.fetch(req, env);
      assert.strictEqual(res.status, 502);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.message, "Gateway error: upstream service unavailable");
      assert.strictEqual(body.stack, undefined);
    });
  });
});
