import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import "dotenv/config";
import app from "./worker.js";

describe("Meerut-Mart Native Cloudflare Worker Backend Test Suite", () => {
  const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || "mock_jwt_secret",
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY,
  };

  describe("1. Root & Health Check", () => {
    test("GET / should return 200 with 'API working'", async () => {
      const req = new Request("http://localhost/", { method: "GET" });
      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert.strictEqual(text, "API working");
    });
  });

  describe("2. CORS Policy for Vercel Frontends", () => {
    test("OPTIONS preflight should permit customer Vercel origin", async () => {
      const req = new Request("http://localhost/api/product/list", {
        method: "OPTIONS",
        headers: {
          Origin: "https://meerut-mart-application.vercel.app",
          "Access-Control-Request-Method": "GET",
        },
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 204);
      assert.strictEqual(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://meerut-mart-application.vercel.app"
      );
      assert.strictEqual(res.headers.get("Access-Control-Allow-Credentials"), "true");
    });

    test("OPTIONS preflight should permit admin Vercel origin", async () => {
      const req = new Request("http://localhost/api/order/list", {
        method: "OPTIONS",
        headers: {
          Origin: "https://meerut-mart-admin.vercel.app",
          "Access-Control-Request-Method": "POST",
        },
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 204);
      assert.strictEqual(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://meerut-mart-admin.vercel.app"
      );
    });

    test("OPTIONS preflight should reject unauthorized malicious origins", async () => {
      const req = new Request("http://localhost/api/user/login", {
        method: "OPTIONS",
        headers: {
          Origin: "https://malicious-attacker.com",
          "Access-Control-Request-Method": "POST",
        },
      });

      const res = await app.fetch(req, env);
      assert.notStrictEqual(
        res.headers.get("Access-Control-Allow-Origin"),
        "https://malicious-attacker.com"
      );
    });
  });

  describe("3. Live Product & Catalog APIs (MongoDB Atlas)", () => {
    test("GET /api/product/list should query MongoDB Atlas and return product catalog", async () => {
      if (!env.MONGODB_URI) {
        console.log("  [SKIP] MongoDB Atlas live test skipped: MONGODB_URI not provided in CI environment");
        return;
      }
      const req = new Request("http://localhost/api/product/list", {
        method: "GET",
        headers: {
          Origin: "https://meerut-mart-application.vercel.app",
        },
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.products));
      assert.ok(data.products.length > 0, "Catalog should have active products");
    });

    test("GET /api/displayproduct should query seller products collection", async () => {
      if (!env.MONGODB_URI) {
        console.log("  [SKIP] MongoDB Atlas live test skipped: MONGODB_URI not provided in CI environment");
        return;
      }
      const req = new Request("http://localhost/api/displayproduct", {
        method: "GET",
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
    });
  });

  describe("4. Authentication & Security Middleware", () => {
    test("POST /api/user/login with unknown account should return 401 Invalid credentials", async () => {
      if (!env.MONGODB_URI) {
        console.log("  [SKIP] MongoDB Atlas live test skipped: MONGODB_URI not provided in CI environment");
        return;
      }
      const req = new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "definitely_nonexistent_user_999@test.com" }),
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.message, "Invalid credentials");
    });

    test("POST /api/user/register with invalid email format should fail validation", async () => {
      if (!env.MONGODB_URI) {
        console.log("  [SKIP] MongoDB Atlas live test skipped: MONGODB_URI not provided in CI environment");
        return;
      }
      const req = new Request("http://localhost/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "not-an-email",
          password: "password123",
        }),
      });

      const res = await app.fetch(req, env);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.ok(data.message.includes("valid email"));
    });

    test("Protected routes without Authorization token should reject with 401", async () => {
      const req = new Request("http://localhost/api/cart/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.ok(data.message.includes("token missing or invalid"));
    });
  });

  describe("5. Order & Reviews Endpoints", () => {
    test("POST /api/order/list should return orders from database", async () => {
      if (!env.MONGODB_URI) {
        console.log("  [SKIP] MongoDB Atlas live test skipped: MONGODB_URI not provided in CI environment");
        return;
      }
      const req = new Request("http://localhost/api/order/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.orders));
    });

    test("GET /api/product/64f123456789012345678901/reviews should return reviews array", async () => {
      if (!env.MONGODB_URI) {
        console.log("  [SKIP] MongoDB Atlas live test skipped: MONGODB_URI not provided in CI environment");
        return;
      }
      const req = new Request(
        "http://localhost/api/product/64f123456789012345678901/reviews",
        { method: "GET" }
      );

      const res = await app.fetch(req, env);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
    });
  });

  after(async () => {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
});
