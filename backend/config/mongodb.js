import mongoose from "mongoose";

let isConnecting = false;

/**
 * Serverless-compatible MongoDB connection manager.
 * Supports connection reuse in warm Cloudflare Workers isolates and standard Node.js daemon.
 *
 * @param {Object} [options]
 * @param {Object} [options.env] - Cloudflare Worker environment bindings
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (options = {}) => {
  // 1. Warm-isolate reuse: Return immediately if already connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If a connection attempt is in progress, wait for it
  if (isConnecting) {
    let retries = 0;
    while (isConnecting && retries < 20) {
      await new Promise((r) => setTimeout(r, 100));
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        return mongoose;
      }
      retries++;
    }
  }

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

  try {
    isConnecting = true;
    await mongoose.connect(finalUri, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
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
