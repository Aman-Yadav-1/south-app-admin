import { authMiddleware, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher([
//     '/'
// ])

// export default clerkMiddleware((auth, req)=>{
//     if(isProtectedRoute(req)) auth().protect();
// });

export default authMiddleware({
  publicRoutes:["/api/:path*"],
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};