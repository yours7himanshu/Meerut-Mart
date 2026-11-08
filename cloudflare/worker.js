/**
 * Cloudflare Worker API Gateway for Meerut-Mart
 * Enterprise-hardened reverse-proxy, edge caching, and security gateway.
 *
 * Architecture:
 *   Cloudflare Edge (Pages / Worker) -> Existing Express Backend -> MongoDB Atlas
 */

// Default origins permitted to access this API gateway
const DEFAULT_ALLOWED_ORIGINS = [
  "https://meerut-mart-application.vercel.app",
  "https://meerut-mart-admin.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

// Regex matching Cloudflare Pages production and preview deployment hostnames (single and multi-level subdomains)
const PAGES_DEV_ORIGIN_REGEX = /^https:\/\/([a-z0-9-]+\.)+pages\.dev$/i;

// Regex matching public product reviews listing GET endpoint
const PUBLIC_REVIEWS_REGEX = /^\/api\/product\/[a-zA-Z0-9_-]+\/reviews$/;

/**
 * Validates whether an incoming Origin is authorized.
 */
export function isAllowedOrigin(origin, env = {}) {
  if (!origin) return false;

  // Check default static whitelist
  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check Cloudflare Pages regex (*.pages.dev)
  if (PAGES_DEV_ORIGIN_REGEX.test(origin)) {
    return true;
  }

  // Check dynamically configured origins via environment variable
  if (env.ALLOWED_ORIGINS) {
    const customOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    if (customOrigins.includes(origin)) {
      return true;
    }
  }

  return false;
}

/**
 * Determines whether a request is safe for public edge caching.
 * STRICT CRITERIA:
 * 1. Method must be GET or HEAD.
 * 2. Request MUST NOT contain Authorization, token, or Cookie headers.
 * 3. Endpoint MUST be on the verified public read-only whitelist.
 */
export function isCacheableRequest(request, url) {
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return false;
  }

  // Never cache requests carrying user identity, credentials, or session state
  if (
    request.headers.get("Authorization") ||
    request.headers.get("token") ||
    request.headers.get("Cookie")
  ) {
    return false;
  }

  const pathname = url.pathname;

  // Strictly whitelisted public read-only endpoints
  if (pathname === "/api/product/list" || pathname === "/api/displayproduct") {
    return true;
  }

  if (PUBLIC_REVIEWS_REGEX.test(pathname)) {
    return true;
  }

  return false;
}

/**
 * Determines whether an upstream response may be placed in the public edge cache.
 */
export function isCacheableResponse(response) {
  if (response.status !== 200) {
    return false;
  }

  // Never cache if upstream sets cookies or returns private/no-store directives
  if (response.headers.has("Set-Cookie")) {
    return false;
  }

  const cacheControl = response.headers.get("Cache-Control") || "";
  if (
    cacheControl.includes("no-store") ||
    cacheControl.includes("no-cache") ||
    cacheControl.includes("private")
  ) {
    return false;
  }

  return true;
}

export default {
  async fetch(request, env = {}, ctx = null) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowed = isAllowedOrigin(origin, env);

    // =========================================================================
    // 1. CORS Preflight (OPTIONS)
    // =========================================================================
    if (request.method === "OPTIONS") {
      if (origin && !allowed) {
        return new Response(
          JSON.stringify({ error: "CORS origin forbidden by gateway policy" }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "X-Content-Type-Options": "nosniff",
            },
          }
        );
      }

      const preflightHeaders = {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, token, X-Requested-With, Accept",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      };

      if (allowed && origin) {
        preflightHeaders["Access-Control-Allow-Origin"] = origin;
        preflightHeaders["Access-Control-Allow-Credentials"] = "true";
      }

      return new Response(null, {
        status: 204,
        headers: preflightHeaders,
      });
    }

    // =========================================================================
    // 2. Strict Origin Backend Resolution (Prevent Open Proxy)
    // =========================================================================
    const rawOrigin = env.BACKEND_ORIGIN || "https://meerut-mart.onrender.com";
    let originBackend;
    try {
      originBackend = new URL(rawOrigin).origin;
    } catch {
      originBackend = "https://meerut-mart.onrender.com";
    }

    // Target URL is strictly constrained to the configured backend origin
    const targetUrl = new URL(url.pathname + url.search, originBackend);

    // =========================================================================
    // 3. Edge Caching Strategy (Public Read Endpoints Only)
    // =========================================================================
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const cacheKey = new Request(targetUrl.toString(), {
      method: "GET",
      headers: new Headers({ Accept: request.headers.get("Accept") || "*/*" }),
    });

    const isCacheEligible = isCacheableRequest(request, url);

    if (isCacheEligible && cache) {
      try {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          const res = new Response(cachedResponse.body, cachedResponse);
          if (allowed && origin) {
            res.headers.set("Access-Control-Allow-Origin", origin);
            res.headers.set("Access-Control-Allow-Credentials", "true");
            res.headers.set("Vary", "Origin");
          }
          res.headers.set("X-Gateway-Cache", "HIT");
          return res;
        }
      } catch (cacheErr) {
        console.error("Cache lookup error:", cacheErr);
      }
    }

    // =========================================================================
    // 4. Request Forwarding & Header Sanitization
    // =========================================================================
    const reqHeaders = new Headers(request.headers);

    // Remove hop-by-hop headers
    reqHeaders.delete("connection");
    reqHeaders.delete("keep-alive");
    reqHeaders.delete("transfer-encoding");

    // Standard client identity forwarding
    const clientIP =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      "127.0.0.1";
    reqHeaders.set("X-Forwarded-For", clientIP);
    reqHeaders.set("CF-Connecting-IP", clientIP);
    reqHeaders.set("X-Forwarded-Host", url.hostname);
    reqHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    const hasBody =
      request.method !== "GET" &&
      request.method !== "HEAD" &&
      request.body !== null;

    const fetchOptions = {
      method: request.method,
      headers: reqHeaders,
      body: hasBody ? request.body : undefined,
      redirect: "follow",
    };

    // Include duplex option when streaming a request body if runtime requires it
    if (hasBody) {
      fetchOptions.duplex = "half";
    }

    const upstreamRequest = new Request(targetUrl.toString(), fetchOptions);

    // =========================================================================
    // 5. Upstream Execution & Response Hardening
    // =========================================================================
    try {
      const response = await fetch(upstreamRequest);
      const modifiedResponse = new Response(response.body, response);

      // Apply CORS headers strictly if origin is in approved whitelist
      if (allowed && origin) {
        modifiedResponse.headers.set("Access-Control-Allow-Origin", origin);
        modifiedResponse.headers.set("Access-Control-Allow-Credentials", "true");
        modifiedResponse.headers.set("Vary", "Origin");
      } else {
        modifiedResponse.headers.delete("Access-Control-Allow-Origin");
        modifiedResponse.headers.delete("Access-Control-Allow-Credentials");
      }

      // Security baseline headers
      modifiedResponse.headers.set("X-Content-Type-Options", "nosniff");
      modifiedResponse.headers.set("X-Frame-Options", "SAMEORIGIN");
      modifiedResponse.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
      );

      // Public Cache storage for verified eligible GET responses
      if (isCacheEligible && isCacheableResponse(response) && cache) {
        modifiedResponse.headers.set(
          "Cache-Control",
          "public, max-age=60, s-maxage=300"
        );
        modifiedResponse.headers.set("X-Gateway-Cache", "MISS");

        const responseToCache = modifiedResponse.clone();
        if (ctx && typeof ctx.waitUntil === "function") {
          ctx.waitUntil(cache.put(cacheKey, responseToCache));
        } else {
          cache.put(cacheKey, responseToCache).catch(() => {});
        }
      } else {
        modifiedResponse.headers.set("X-Gateway-Cache", "BYPASS");
      }

      return modifiedResponse;
    } catch (err) {
      console.error("Gateway upstream fetch failure:", err.message);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Gateway error: upstream service unavailable",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            ...(allowed && origin
              ? {
                  "Access-Control-Allow-Origin": origin,
                  "Access-Control-Allow-Credentials": "true",
                  "Vary": "Origin",
                }
              : {}),
          },
        }
      );
    }
  },
};
