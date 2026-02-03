import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, getUserData } from "./lib/cookie";

const publicPaths = ["/", "/login", "/register", "/forget-password"];

// Admin-only routes
const adminOnlyPaths = ["/admin", "/users"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getAuthToken();
  const user = token ? await getUserData() : null;
const roleName =
  typeof user?.role === "string"
    ? user.role
    : user?.role?.name || user?.roleId?.roleName || user?.role?.roleName;

const isAdmin = roleName?.toLowerCase() === "admin";
  const isPublicPath = publicPaths.some((path) => {
    // root should match only exactly "/"
    if (path === "/") return pathname === "/";
    // other public paths match the path or its sub-routes
    return pathname === path || pathname.startsWith(`${path}/`);
  });

  const isAdminOnlyPath = adminOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Not logged in → redirect to login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in but trying to access admin-only route
  if (user && isAdminOnlyPath && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  //Logged in user should not access public pages (/, login, register, etc.)
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/users/:path*", 
    "/dashboard/:path*",
    "/login",
    "/register",
    "/",
  ],
};
