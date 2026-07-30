/**
 * Shared server helpers (auth cloud + Redis).
 * Kept outside /api so Vercel bundles it into every serverless function.
 *
 * Env: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   (ou KV_REST_API_URL + KV_REST_API_TOKEN)
 * Opcional: AUTH_SECRET (HMAC de sessão)
 */
const crypto = require("crypto");

const PBKDF2_ITERS = 120000;
const USER_PREFIX = "aprova:user:";

function cors (res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

function json (res, status, body) {
  cors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function redisEnv () {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
  return { url: String(url).replace(/\/$/, ""), token: String(token) };
}

function cloudConfigured () {
  const { url, token } = redisEnv();
  return Boolean(url && token);
}

async function redisCommand (command) {
  const { url, token } = redisEnv();
  if (!url || !token) {
    const err = new Error("Redis não configurado");
    err.code = "NO_REDIS";
    throw err;
  }
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data.error || "Falha Redis");
    err.code = "REDIS_HTTP";
    err.status = r.status;
    throw err;
  }
  return data.result;
}

function normalizeEmail (email) {
  return String(email || "").trim().toLowerCase();
}

function userKey (email) {
  return USER_PREFIX + normalizeEmail(email);
}

function hashPassword (password, salt) {
  return crypto.pbkdf2Sync(String(password), String(salt), PBKDF2_ITERS, 32, "sha256").toString("hex");
}

function newSalt () {
  return crypto.randomBytes(16).toString("hex");
}

function publicUser (row) {
  if (!row) return null;
  return {
    email: row.email,
    name: row.name || "",
    phone: row.phone || "",
    plan: row.plan || "free",
    planUntil: row.planUntil == null ? null : row.planUntil,
    status: row.status || "active",
    createdAt: row.createdAt || null,
    grantedAt: row.grantedAt || null,
    coupon: row.coupon || null,
    embassador: row.embassador || ""
  };
}

async function getUser (email) {
  const raw = await redisCommand(["GET", userKey(email)]);
  if (raw == null || raw === "") return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return null;
  }
}

async function setUser (row) {
  const key = userKey(row.email);
  await redisCommand(["SET", key, JSON.stringify(row)]);
  return row;
}

function authSecret () {
  return process.env.AUTH_SECRET || process.env.UPSTASH_REDIS_REST_TOKEN || "medhub-r1-dev-secret";
}

function issueToken (email) {
  const exp = Date.now() + 90 * 86400000;
  const payload = normalizeEmail(email) + "|" + exp;
  const sig = crypto.createHmac("sha256", authSecret()).update(payload).digest("base64url");
  return Buffer.from(payload, "utf8").toString("base64url") + "." + sig;
}

function verifyToken (token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 2) return null;
    const payload = Buffer.from(parts[0], "base64url").toString("utf8");
    const sig = parts[1];
    const expect = crypto.createHmac("sha256", authSecret()).update(payload).digest("base64url");
    if (sig !== expect) return null;
    const [email, expStr] = payload.split("|");
    if (!email || Date.now() > Number(expStr)) return null;
    return normalizeEmail(email);
  } catch {
    return null;
  }
}

function readBody (req) {
  return new Promise((resolve, reject) => {
    if (req.body != null) {
      if (Buffer.isBuffer(req.body)) {
        try {
          const text = req.body.toString("utf8");
          resolve(text ? JSON.parse(text) : {});
        } catch (e) {
          reject(e);
        }
        return;
      }
      if (typeof req.body === "string") {
        try {
          resolve(req.body ? JSON.parse(req.body) : {});
        } catch (e) {
          reject(e);
        }
        return;
      }
      if (typeof req.body === "object") {
        resolve(req.body);
        return;
      }
    }
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 200000) {
        reject(new Error("Body grande demais"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  cors,
  json,
  cloudConfigured,
  redisCommand,
  normalizeEmail,
  hashPassword,
  newSalt,
  publicUser,
  getUser,
  setUser,
  issueToken,
  verifyToken,
  readBody
};
