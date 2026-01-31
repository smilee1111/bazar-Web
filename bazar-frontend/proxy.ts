import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/forget-password"];
const ADMIN_PREFIX = "/admin";
const USER_PREFIX = "/user";
const SELLER_PREFIX = "/seller";

type ParsedUser = {
    role?: string | null;
    roleMeta?: {
        code?: string;
        name?: string;
    } | null;
};

const parseUserCookie = (value?: string | null): ParsedUser | null => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (_err) {
        try {
            return JSON.parse(decodeURIComponent(value));
        } catch {
            return null;
        }
    }
};

const isAdminRole = (user: ParsedUser | null): boolean => {
    if (!user) return false;
    const roleCode = user.roleMeta?.code || user.role || user.roleMeta?.name;
    const roleName = user.roleMeta?.name?.toLowerCase();
    if (roleName === "admin") return true;
    if (roleCode && roleCode.toLowerCase().includes("admin")) return true;
    if (roleCode === "role_admin_001") return true;
    return false;
};

const isSellerRole = (user: ParsedUser | null): boolean => {
    if (!user) return false;
    const roleCode = user.roleMeta?.code || user.role || user.roleMeta?.name;
    if (!roleCode) return false;
    const normalized = roleCode.toLowerCase();
    return normalized.includes("seller") || normalized === "role_seller_001";
};

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("auth_token")?.value || null;
    const user = parseUserCookie(req.cookies.get("user_data")?.value);
    const isAdminPath = pathname.startsWith(ADMIN_PREFIX);
    const isUserPath = pathname.startsWith(USER_PREFIX);
    const isSellerPath = pathname.startsWith(SELLER_PREFIX);
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
    const admin = isAdminRole(user);
    const seller = isSellerRole(user);

    if (!token && (isAdminPath || isUserPath || isSellerPath)) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && isPublicPath) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (isAdminPath && !admin) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if ((isUserPath || isSellerPath) && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isSellerPath && !(admin || seller)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/user/:path*",
        "/seller/:path*",
        "/login",
        "/register",
    ],
};