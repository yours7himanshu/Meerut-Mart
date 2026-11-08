/**
 * Cloudflare Worker Backend for Meerut-Mart
 * Native Hono Edge Application with Serverless Mongoose and Cloudinary REST.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import connectDB, { disconnectDB } from "./config/mongodb.js";

// Controllers
import {
  loginUser,
  registerUser,
  superAdminLogin,
  promoteToAdmin,
  demoteToUser,
} from "./controllers/userController.js";
import adminLogin from "./controllers/adminController.js";
import getAllSellers from "./controllers/getAllSellers.js";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
} from "./controllers/productController.js";
import {
  addToCart,
  updateCart,
  getUserCart,
} from "./controllers/cartController.js";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
} from "./controllers/orderController.js";
import sellerController from "./controllers/sellerController.js";
import { sellProduct, addItemToWebsite } from "./controllers/sellProduct.js";
import SellProduct from "./models/sellerProductModel.js";
import Review from "./models/reviewModel.js";
import sendEmail from "./utils/sendEmail.js";

// Middlewares
import authUser from "./middleware/auth.js";
import adminAuth from "./middleware/adminAuth.js";
import superAdminAuth from "./middleware/superAdminAuth.js";

const app = new Hono();

// =============================================================================
// CORS Configuration
// =============================================================================
const allowedOrigins = [
  "https://meerut-mart-application.vercel.app",
  "https://meerut-mart-admin.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".pages.dev")
      ) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "token",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    maxAge: 86400,
  })
);

// =============================================================================
// Express-to-Hono Handler Adapter with Request-Scoped DB Discipline
// =============================================================================
export function toHonoHandler(...middlewares) {
  return async (c) => {
    // 1. Sync Worker bindings to process.env
    if (c.env) {
      for (const [k, v] of Object.entries(c.env)) {
        if (typeof v === "string") {
          process.env[k] = v;
        }
      }
    }

    const mongoUri =
      (c.env && c.env.MONGODB_URI) ||
      (typeof process !== "undefined" && process.env.MONGODB_URI);

    // 2. Parse Request Body & Multipart Files
    const contentType = c.req.header("content-type") || "";
    let parsedBody = {};
    const parsedFiles = {};

    if (contentType.includes("application/json")) {
      try {
        parsedBody = await c.req.json();
      } catch {
        parsedBody = {};
      }
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      try {
        const fd = await c.req.formData();
        for (const [key, val] of fd.entries()) {
          if (
            val &&
            typeof val === "object" &&
            typeof val.arrayBuffer === "function"
          ) {
            const buffer = Buffer.from(await val.arrayBuffer());
            const fileObj = {
              buffer,
              originalname: val.name || "upload.jpg",
              mimetype: val.type || "image/jpeg",
              size: buffer.length,
            };
            if (!parsedFiles[key]) parsedFiles[key] = [];
            parsedFiles[key].push(fileObj);
          } else {
            parsedBody[key] = val;
          }
        }
      } catch (err) {
        console.error("FormData parse error:", err);
      }
    }

    // 3. Build Mock Express Request & Response Objects
    const headers = {};
    for (const [k, v] of c.req.raw.headers.entries()) {
      headers[k.toLowerCase()] = v;
    }

    const req = {
      body: parsedBody,
      files: parsedFiles,
      file: Object.values(parsedFiles)[0]?.[0] || null,
      headers,
      query: c.req.query(),
      params: c.req.param(),
      path: c.req.path,
      method: c.req.method,
      user: c.get("user") || null,
      env: c.env || process.env,
    };

    let statusCode = 200;
    const responseHeaders = new Headers();
    let responseData = null;
    let ended = false;

    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      setHeader(name, val) {
        responseHeaders.set(name, String(val));
        return res;
      },
      header(name, val) {
        responseHeaders.set(name, String(val));
        return res;
      },
      json(data) {
        if (ended) return;
        ended = true;
        statusCode = statusCode || 200;
        responseHeaders.set("Content-Type", "application/json");
        responseData = JSON.stringify(data);
      },
      send(data) {
        if (ended) return;
        ended = true;
        if (typeof data === "object") {
          responseHeaders.set("Content-Type", "application/json");
          responseData = JSON.stringify(data);
        } else {
          responseData = String(data);
        }
      },
    };

    // 4. Request-scoped DB connection: connect fresh and disconnect in finally
    try {
      if (mongoUri) {
        await connectDB({ env: c.env });
      }

      // 5. Execute middleware and controller chain sequentially
      for (const mw of middlewares) {
        if (ended) break;
        let nextCalled = false;
        await new Promise((resolve, reject) => {
          try {
            const result = mw(req, res, (err) => {
              if (err) reject(err);
              nextCalled = true;
              resolve();
            });
            if (result && typeof result.then === "function") {
              result
                .then(() => {
                  if (!nextCalled) resolve();
                })
                .catch(reject);
            } else if (!nextCalled && ended) {
              resolve();
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    } catch (chainErr) {
      console.error("Middleware chain error:", chainErr);
      return c.json(
        { success: false, message: chainErr.message || "Internal server error" },
        500
      );
    } finally {
      // Disconnect immediately so TCP sockets never leak to the next request
      if (mongoUri) {
        await disconnectDB();
      }
    }

    return new Response(responseData, {
      status: statusCode,
      headers: responseHeaders,
    });
  };
}

// =============================================================================
// API Routes
// =============================================================================

// Root & Health
app.get("/", (c) => c.text("API working"));

// User Routes (/api/user)
app.post("/api/user/register", toHonoHandler(registerUser));
app.post("/api/user/login", toHonoHandler(loginUser));
app.post("/api/user/admin", toHonoHandler(adminLogin));
app.post("/api/user/superadmin", toHonoHandler(superAdminLogin));
app.get("/api/user", toHonoHandler(superAdminAuth, getAllSellers));
app.post("/api/user/promote-admin", toHonoHandler(superAdminAuth, promoteToAdmin));
app.post("/api/user/demote-admin", toHonoHandler(superAdminAuth, demoteToUser));

// Product Routes (/api/product)
app.get("/api/product/list", toHonoHandler(listProducts));
app.post("/api/product/add", toHonoHandler(addProduct));
app.post("/api/product/remove", toHonoHandler(removeProduct));
app.post("/api/product/single", toHonoHandler(singleProduct));

// Display Product Route (/api/displayproduct)
app.get("/api/displayproduct", async (c) => {
  const mongoUri =
    (c.env && c.env.MONGODB_URI) ||
    (typeof process !== "undefined" && process.env.MONGODB_URI);
  try {
    if (mongoUri) await connectDB({ env: c.env });
    const products = await SellProduct.find({});
    return c.json(products, 200);
  } catch (error) {
    console.error("Display product error:", error);
    return c.json({ message: "Server error", error: error.message }, 500);
  } finally {
    if (mongoUri) await disconnectDB();
  }
});

// Cart Routes (/api/cart)
app.post("/api/cart/get", toHonoHandler(authUser, getUserCart));
app.post("/api/cart/add", toHonoHandler(authUser, addToCart));
app.post("/api/cart/update", toHonoHandler(authUser, updateCart));

// Order Routes (/api/order)
app.post("/api/order/place", toHonoHandler(authUser, placeOrder));
app.post("/api/order/stripe", toHonoHandler(authUser, placeOrderStripe));
app.post("/api/order/razorpay", toHonoHandler(authUser, placeOrderRazorpay));
app.post("/api/order/list", toHonoHandler(allOrders));
app.post("/api/order/userorders", toHonoHandler(authUser, userOrders));
app.post("/api/order/status", toHonoHandler(adminAuth, updateStatus));

// Seller Routes (/api)
app.post("/api/become-seller", toHonoHandler(authUser, sellerController));
app.post("/api/sell-item", toHonoHandler(sellProduct));
app.post("/api/add-item-website/:id", toHonoHandler(addItemToWebsite));

// Review Routes (/api/product/:id/reviews)
app.post("/api/product/:id/reviews", async (c) => {
  const mongoUri =
    (c.env && c.env.MONGODB_URI) ||
    (typeof process !== "undefined" && process.env.MONGODB_URI);
  const productId = c.req.param("id");
  try {
    if (mongoUri) await connectDB({ env: c.env });
    const body = await c.req.json();
    const { userName, rating, reviewText } = body;
    const newReview = new Review({ productId, userName, rating, reviewText });
    await newReview.save();
    return c.json({ message: "Review saved successfully!" }, 201);
  } catch (error) {
    return c.json({ error: "Error saving review", message: error.message }, 400);
  } finally {
    if (mongoUri) await disconnectDB();
  }
});

app.get("/api/product/:id/reviews", async (c) => {
  const mongoUri =
    (c.env && c.env.MONGODB_URI) ||
    (typeof process !== "undefined" && process.env.MONGODB_URI);
  const productId = c.req.param("id");
  try {
    if (mongoUri) await connectDB({ env: c.env });
    const reviews = await Review.find({ productId });
    return c.json(reviews, 200);
  } catch (error) {
    return c.json({ error: "Error fetching reviews", message: error.message }, 400);
  } finally {
    if (mongoUri) await disconnectDB();
  }
});

// Email Route (/send-email)
app.post("/send-email", async (c) => {
  try {
    const { emails, message } = await c.req.json();
    await sendEmail(emails, message, { env: c.env });
    return c.json({ message: "Emails sent successfully" }, 200);
  } catch (error) {
    console.error("Error sending email:", error);
    return c.json({ message: "Error sending email", error: error.message }, 500);
  }
});

export default app;
