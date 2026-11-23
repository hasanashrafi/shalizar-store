import "server-only";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";

import { USER_SESSION_COOKIE } from "@/lib/user-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export type SessionRole = "customer" | "admin" | null;

function getUserSessionKey(): Uint8Array {
  const secret = process.env.USER_SESSION_SECRET;
  if (!secret) throw new Error("USER_SESSION_SECRET is required");
  return new TextEncoder().encode(secret);
}

function getAdminSessionKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 16 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyUserSession(): Promise<{ userId: string } | null> {
  const token = (await cookies()).get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getUserSessionKey(), {
      issuer: "shalizar-customer",
      audience: "shalizar-customer",
      algorithms: ["HS256"],
    });
    if (payload.role !== "customer") return null;
    return { userId: typeof payload.sub === "string" ? payload.sub : "" };
  } catch {
    return null;
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getAdminSessionKey(), {
      issuer: "shalizar-admin",
      audience: "shalizar-admin",
      algorithms: ["HS256"],
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function getCurrentSessionRole(): Promise<SessionRole> {
  const isAdmin = await verifyAdminSession();
  if (isAdmin) return "admin";

  const userSession = await verifyUserSession();
  if (userSession) return "customer";

  return null;
}

export async function requireSession(
  allowedRoles: SessionRole[],
): Promise<SessionRole | null> {
  const role = await getCurrentSessionRole();
  if (!role || !allowedRoles.includes(role)) return null;
  return role;
}
