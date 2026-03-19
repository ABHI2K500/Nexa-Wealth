import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/",
    "/transactions/:path*",
    "/analytics/:path*",
    "/ai-insights/:path*",
    "/settings/:path*"
  ],
};
