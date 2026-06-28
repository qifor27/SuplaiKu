/**
 * siHutang — NextAuth API Route Handler
 *
 * ECC security: All auth handled server-side via httpOnly JWT cookies.
 */

import { handlers } from '@/lib/auth';

// Export handlers directly but cast to any to satisfy Next.js 16 strict typings
export const GET = handlers.GET as any;
export const POST = handlers.POST as any;
