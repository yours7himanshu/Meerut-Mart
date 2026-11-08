import mongoose from "mongoose";

let isConnecting = false;

/**
 * Cleanly disconnects and resets Mongoose connections.
 * In Cloudflare Workers, this is essential to prevent TCP sockets from
 * outliving the HTTP request that created them.
 */
export const disconnectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }
};

/**
 * Serverless request-scoped MongoDB connection manager.
 * In Cloudflare Workers, TCP sockets cannot be shared across requests.
 * We must connect fresh inside each request's I/O context and disconnect
 * when the request finishes.
 *
 * @param {Object} [options]
 * @param {Object} [options.env] - Cloudflare Worker environment bindings
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async (options = {}) => {
  const env = options.env || (typeof process !== "undefined" ? process.env : {});
  const rawUri = env.MONGODB_URI;

  if (!rawUri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  // Ensure DB name /meerutMart is correctly attached
  let finalUri = rawUri;
  if (!finalUri.includes("/meerutMart")) {
    const queryIndex = finalUri.indexOf("?");
    if (queryIndex !== -1) {
      finalUri = `${finalUri.substring(0, queryIndex)}/meerutMart${finalUri.substring(queryIndex)}`;
    } else {
      finalUri = `${finalUri.replace(/\/+$/, "")}/meerutMart`;
    }
  }

  // If already connected from a prior request context, drop stale sockets
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }

  try {
    isConnecting = true;
    await mongoose.connect(finalUri, {
      bufferCommands: false,
      maxPoolSize: 1, // Single connection per request context to prevent socket exhaustion
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4 for reliable Atlas resolution in edge runtimes
    });
    isConnecting = false;
    return mongoose;
  } catch (err) {
    isConnecting = false;
    console.error("MongoDB Atlas Connection Failed:", err.message);
    throw err;
  }
};

export default connectDB;
