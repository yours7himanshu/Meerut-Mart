# Engineering Implementation Plan: Meerut-Mart Backend Cloudflare Worker Rewrite

**Project:** Meerut-Mart Backend  
**Architecture Pattern:** Hono + Cloudflare Workers (`nodejs_compat`) + Serverless Mongoose + Cloudinary REST  
**Target Platform:** Cloudflare Workers (Standalone API Service)  
**Branch:** `cloudflare-migration`  

---

## 1. Objectives & Scope

1. **Frontend & Admin Isolation:** Keep customer `frontend/` and `admin/` 100% Vercel-focused. Remove unnecessary Cloudflare Pages files (`_redirects`, `_headers`, `wrangler.toml`).
2. **Backend Native Cloudflare Worker:** Re-architect the Express backend into a high-performance, edge-native Cloudflare Worker using **Hono** with Node.js compatibility (`nodejs_compat`).
3. **Database (MongoDB Atlas):** Preserve the existing MongoDB Atlas cluster and all 7 Mongoose collections without data migrations, using a serverless Mongoose connection lifecycle manager.
4. **Password Hashing:** Migrate from native C++ `bcrypt` to pure JavaScript `bcryptjs`.
5. **Media Storage (Cloudinary):** Replace `multer.diskStorage` with an in-memory multipart parser and direct HTTPS REST API uploader with WebCrypto SHA-1 signatures.
6. **API Parity:** Maintain 100% signature and response contract compatibility across all endpoints:
   - `/api/user/*` (Register, Login, Admin Login, SuperAdmin Login, Sellers list, Promote, Demote)
   - `/api/product/*` (Add with 4 images, Remove, Single, List)
   - `/api/displayproduct`
   - `/api/cart/*` (Get, Add, Update)
   - `/api/order/*` (Place COD, Status Update, List, UserOrders, Stripe/Razorpay stubs)
   - `/api/become-seller`, `/api/sell-item`, `/api/add-item-website/:id`
   - `/api/product/:id/reviews` (Post review, Get reviews)
   - `/send-email`
7. **CORS:** Restrict CORS specifically to Vercel production origins and local development.
8. **Automated Verification:** Comprehensive test suite with 100% passing tests.

---

## 2. Technical Architecture

```mermaid
flowchart LR
    subgraph Vercel["Vercel Hosted Frontends"]
        FE["Customer App (https://meerut-mart-application.vercel.app)"]
        Admin["Admin App (https://meerut-mart-admin.vercel.app)"]
    end

    subgraph CFWorker["Cloudflare Workers Runtime (workerd with nodejs_compat)"]
        HonoApp["Hono API Application (backend/worker.js)"]
        CORS["Strict CORS Middleware"]
        AuthMiddleware["JWT Authentication Middleware"]
        CloudinaryREST["Cloudinary REST Service (WebCrypto SHA-1)"]
        MongooseManager["Serverless Mongoose Connection Pool (backend/config/mongodb.js)"]
    end

    subgraph ManagedCloud["Managed External Services"]
        Atlas[("MongoDB Atlas Database Cluster")]
        Cloudinary["Cloudinary Media API"]
    end

    FE -->|HTTPS API Requests| CORS
    Admin -->|HTTPS API Requests| CORS
    CORS --> HonoApp
    HonoApp --> AuthMiddleware
    HonoApp --> MongooseManager
    HonoApp --> CloudinaryREST
    MongooseManager -->|TLS Socket (cloudflare:sockets / net)| Atlas
    CloudinaryREST -->|HTTPS Direct Uploads| Cloudinary
```

---

## 3. Step-by-Step Execution Plan

### Step 1: Frontend & Admin Cleanup
* Remove Cloudflare Pages configuration files from `frontend/` and `admin/` (`public/_redirects`, `public/_headers`, `wrangler.toml`).
* Leave both folders in their original clean Vercel state.

### Step 2: Install Edge Dependencies in `backend/`
* Install `hono` (v4) and `bcryptjs`.
* Update `backend/package.json` scripts.

### Step 3: Implement Edge-Compatible Cloudinary REST Service
* Create `backend/services/cloudinaryService.js`.
* Uses standard `fetch()` and `FormData`.
* Computes SHA-1 signatures with `crypto.subtle` (WebCrypto) with Node crypto fallback.
* Eliminates `multer.diskStorage` and disk writes.

### Step 4: Adapt Serverless MongoDB Manager
* Update `backend/config/mongodb.js` to support warm-isolate Mongoose connection caching (`maxPoolSize: 1`, `bufferCommands: false`).
* Ensures seamless compatibility with `nodejs_compat`.

### Step 5: Controller & Middleware Edge Modernization
* Update `backend/controllers/userController.js` and `backend/controllers/adminController.js` to use `bcryptjs`.
* Update `productController.js` and `sellProduct.js` to handle both memory file buffers and standard request data.

### Step 6: Native Cloudflare Worker Implementation
* Create `backend/worker.js` with Hono.
* Mount all 8 route groups with full middleware and validation.
* Configure strict CORS for Vercel and local origins.

### Step 7: Configure Wrangler Manifest
* Create `backend/wrangler.json` with:
  * `"compatibility_flags": ["nodejs_compat"]`
  * `"compatibility_date": "2024-09-23"`
  * Environment variable bindings.

### Step 8: Automated Verification & Live Testing
* Create `backend/worker.test.mjs` verifying the Hono Cloudflare Worker.
* Execute unit and integration tests against live MongoDB Atlas.
* Verify 100% test pass rate.

### Step 9: Documentation & Commit
* Update `README.md` and migration docs.
* Commit all changes to `cloudflare-migration`.
