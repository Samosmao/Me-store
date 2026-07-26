import crypto from "crypto";

const SECRET = process.env.ADMIN_PASSWORD || "change-me";
const COOKIE_NAME = "app_store_admin";

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionCookieValue() {
  const value = `admin:${Date.now()}`;
  const sig = sign(value);
  return `${value}.${sig}`;
}

export function isValidSession(cookieValue) {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;
  const [value, sig] = parts;
  const expected = sign(value);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
