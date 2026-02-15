/**
 * Admin authentication utilities.
 *
 * Credentials can be overridden via environment variables:
 *   ADMIN_USERNAME  (default: "admin")
 *   ADMIN_PASSWORD  (default: "admin123")
 *
 * Uses HMAC-SHA256 signed session tokens stored in an httpOnly cookie.
 */
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.ADMIN_SECRET || 'al-rabee-admin-secret-2024';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const COOKIE_NAME = 'admin_session';

// ─── Credentials ─────────────────────────────────────────────────
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// ─── Token helpers ───────────────────────────────────────────────
export function createSessionToken(username: string): string {
  const payload = JSON.stringify({ u: username, t: Date.now() });
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + hmac;
}

export function verifySessionToken(token: string): boolean {
  try {
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return false;
    const payloadB64 = token.slice(0, dotIdx);
    const signature = token.slice(dotIdx + 1);
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    return signature === expected;
  } catch {
    return false;
  }
}

// ─── Cookie-based auth check (for use in API routes) ─────────────
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}

/** Returns a 401 JSON response for unauthenticated requests */
export function unauthorizedResponse() {
  return Response.json(
    { success: false, message: 'Unauthorized — please log in at /admin/login' },
    { status: 401 }
  );
}
