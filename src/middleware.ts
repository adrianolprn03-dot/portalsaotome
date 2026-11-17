import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccessAdminPath } from "@/lib/rbac-routes";

export default withAuth(
    function middleware(req) {
        const pathname = req.nextUrl.pathname;
        const role = req.nextauth.token?.role as string | undefined;

        if (!canAccessAdminPath(role, pathname)) {
            const redirectUrl = new URL("/admin?acesso=restrito", req.url);
            return NextResponse.redirect(redirectUrl);
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

export const config = {
    matcher: ["/admin", "/admin/((?!login).*)"],
};
