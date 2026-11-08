/**
 * Cloudflare Worker API Gateway for Meerut-Mart
 * Acts as an edge reverse-proxy, caching layer, and security boundary in front of the origin Node.js backend.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const originBackend = env.BACKEND_ORIGIN || "https://meerut-mart.onrender.com";

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, token",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Edge Caching Strategy for public product listings
    const cache = caches.default;
    const isCacheable =
      request.method === "GET" &&
      (url.pathname === "/api/product/list" ||
        url.pathname === "/api/displayproduct" ||
        url.pathname.includes("/reviews"));

    if (isCacheable) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Proxy request to the backend origin
    const targetUrl = new URL(url.pathname + url.search, originBackend);
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("X-Forwarded-Host", url.hostname);
    reqHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    const newRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "follow",
    });

    try {
      const response = await fetch(newRequest);
      const modifiedResponse = new Response(response.body, response);

      // Edge security headers and CORS
      const origin = request.headers.get("Origin");
      if (origin) {
        modifiedResponse.headers.set("Access-Control-Allow-Origin", origin);
        modifiedResponse.headers.set("Access-Control-Allow-Credentials", "true");
      } else {
        modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");
      }

      modifiedResponse.headers.set("X-Content-Type-Options", "nosniff");
      modifiedResponse.headers.set("X-Frame-Options", "SAMEORIGIN");

      // Cache successful GET responses for public listings
      if (isCacheable && response.status === 200) {
        modifiedResponse.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
        ctx.waitUntil(cache.put(request, modifiedResponse.clone()));
      }

      return modifiedResponse;
    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "API Gateway failed to reach backend origin",
          error: err.message,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
