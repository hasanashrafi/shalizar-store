import "server-only";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import User, { type IUser } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export const USER_SESSION_COOKIE = "shalizar-user-session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

let sessionKeyCache: Uint8Array | null = null;

function getSessionKey(): Uint8Array {
  if (sessionKeyCache) return sessionKeyCache;
  const secret =
    process.env.USER_SESSION_SECRET ?? randomBytes(32).toString("hex");
  sessionKeyCache = new TextEncoder().encode(secret);
  return sessionKeyCache;
}

export function isUserAuthConfigured(): boolean {
  return true;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUserSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId, role: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("shalizar-customer")
    .setAudience("shalizar-customer")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionKey());

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

export async function getUserSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;

  const key = getSessionKey();
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: "shalizar-customer",
      audience: "shalizar-customer",
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function requireUserLogin(): Promise<string> {
  const userId = await getUserSessionUserId();
  if (!userId) redirect("/auth/login");

  await connectToDatabase();
  const user = await User.findById(userId).lean<IUser>();
  if (!user || !user.isActive) {
    await clearUserSession();
    redirect("/auth/login");
  }
  return userId;
}

export async function authenticateUser(
  phone: string,
  password: string,
): Promise<{ id: string; name: string } | null> {
  await connectToDatabase();
  const user = await User.findOne({ phone }).lean();
  if (!user || !user.isActive) return null;
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user._id.toString(), name: user.name };
}

export async function registerUser({
  name,
  phone,
  password,
}: {
  name: string;
  phone: string;
  password: string;
}): Promise<{ id: string; name: string } | { error: string }> {
  await connectToDatabase();
  const existing = await User.findOne({ phone }).lean();
  if (existing) {
    return { error: "این شماره تماس قبلاً ثبت شده است." };
  }
  const passwordHash = await hashPassword(password);
  const created = await User.create({
    name: name.trim(),
    phone: phone.trim(),
    passwordHash,
    isActive: true,
  });
  return { id: created._id.toString(), name: created.name };
}

export async function getUserById(userId: string): Promise<IUser | null> {
  await connectToDatabase();
  return User.findById(userId).lean();
}
