import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const USER_SESSION_COOKIE = "shalizar-user-session";
const ADMIN_SESSION_COOKIE = "shalizar-admin-session";

const adminRoutes = ["/admin", "/admin/orders", "/admin/products", "/admin/login"];
const customerRoutes = [
  "/dashboard",
  "/dashboard/wishlist",
  "/cart",
  "/checkout",
  "/orders",
];
const authRoutes = ["/auth/login", "/auth/register"];

function getSessionKey(secret: string | undefined): Uint8Array {
  if (!secret) throw new Error("Session secret is required");
  return new TextEncoder().encode(secret);
}

async function verifyUserToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSessionKey(process.env.USER_SESSION_SECRET), {
      issuer: "shalizar-customer",
      audience: "shalizar-customer",
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || secret.length < 16) return false;
    await jwtVerify(token, getSessionKey(secret), {
      issuer: "shalizar-admin",
      audience: "shalizar-admin",
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get(USER_SESSION_COOKIE)?.value;
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  const isCustomer = userToken ? await verifyUserToken(userToken) : false;
  const isAdmin = adminToken ? await verifyAdminToken(adminToken) : false;
  const isAuthenticated = isCustomer || isAdmin;

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isCustomerRoute = customerRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isCustomerRoute && !isCustomer) {
    // Admins may view order invoices/details but not the customer-only pages
    const isOrderRoute =
      pathname === "/orders" || pathname.startsWith("/orders/");
    if (!(isOrderRoute && isAdmin)) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  if (isAuthRoute && isAuthenticated) {
    const target = isAdmin ? "/admin/orders" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/cart",
    "/checkout",
    "/orders",
    "/orders/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
