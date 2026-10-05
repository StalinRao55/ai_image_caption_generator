import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generate/:path*",
    "/history/:path*",
    "/saved/:path*",
    "/analytics/:path*",
    "/pricing",
    "/settings/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
