/**
 * siHutang — Auth Proxy (Next.js 16+)
 *
 * ECC security-review: Protect all dashboard routes.
 * Only /login and /api/auth are public.
 * Redirect unauthenticated users to /login.
 */

export { auth as proxy } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (icons, manifest, sw.js)
     * - api/auth (NextAuth routes)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icons/|manifest\\.json|sw\\.js|api/auth).*)',
  ],
};
