import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = request.nextUrl.pathname;
      const protectedPath =
        path.startsWith("/dashboard") ||
        path.startsWith("/generate") ||
        path.startsWith("/history") ||
        path.startsWith("/saved") ||
        path.startsWith("/analytics") ||
        path.startsWith("/settings") ||
        path.startsWith("/profile") ||
        path.startsWith("/admin") ||
        path === "/pricing";
      if (protectedPath && !isLoggedIn) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
