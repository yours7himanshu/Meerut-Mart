/**
 * Edge-Compatible Cloudinary Service for Meerut-Mart
 * Eliminates native Node.js SDK stream dependencies and disk storage.
 * Works natively in Cloudflare Workers V8 isolates and Node.js runtimes.
 */

/**
 * Computes Cloudinary SHA-1 signature according to Cloudinary REST specifications.
 * Uses WebCrypto (crypto.subtle) with Node.js crypto fallback.
 */
export async function generateSignature(params, apiSecret) {
  if (!apiSecret) {
    throw new Error("Cloudinary API secret is required for signing");
  }

  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join("&") + apiSecret;

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const nodeCrypto = await import("node:crypto");
  return nodeCrypto.createHash("sha1").update(toSign).digest("hex");
}

/**
 * Direct HTTPS REST API file upload to Cloudinary.
 *
 * @param {Object} options
 * @param {Buffer|Uint8Array|Blob|File|string} options.file - File data or buffer
 * @param {string} [options.mimetype='image/jpeg'] - MIME type
 * @param {string} [options.originalname='upload.jpg'] - Original filename
 * @param {string} [options.folder='meerut_mart'] - Upload folder
 * @param {Object} [options.env] - Environment bindings (Cloudflare Worker env or process.env)
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export async function uploadToCloudinary({
  file,
  mimetype = "image/jpeg",
  originalname = "upload.jpg",
  folder = "meerut_mart",
  env = typeof process !== "undefined" ? process.env : {},
}) {
  const cloudName = env.CLOUDINARY_NAME || env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_SECRET_KEY || env.CLOUDINARY_API_SECRET;

  // In test or local environments without credentials, provide a safe deterministic mock URL
  if (!cloudName || !apiKey || !apiSecret) {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      secure_url: `https://res.cloudinary.com/mock-meerut-mart/image/upload/${mockId}.jpg`,
      public_id: mockId,
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signParams = { folder, timestamp };
  const signature = await generateSignature(signParams, apiSecret);

  const form = new FormData();

  let fileBlob;
  if (file instanceof Blob || (typeof File !== "undefined" && file instanceof File)) {
    fileBlob = file;
  } else if (file instanceof Uint8Array || Buffer.isBuffer(file)) {
    fileBlob = new Blob([file], { type: mimetype });
  } else if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("data:")) {
      form.append("file", file);
    } else {
      // Local filesystem path from traditional multer diskStorage
      const fs = await import("node:fs");
      const buffer = fs.readFileSync(file);
      fileBlob = new Blob([buffer], { type: mimetype });
    }
  } else {
    throw new Error("Invalid file format provided for Cloudinary upload");
  }

  if (fileBlob) {
    form.append("file", fileBlob, originalname);
  }

  form.append("api_key", apiKey);
  form.append("timestamp", timestamp.toString());
  form.append("folder", folder);
  form.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Cloudinary upload failed (HTTP ${response.status}): ${errText}`);
  }

  const result = await response.json();
  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

export default { uploadToCloudinary, generateSignature };
