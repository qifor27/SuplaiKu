/**
 * siHutang — Home Page
 *
 * Redirects to /dashboard if authenticated, or /login if not.
 * ECC: Server component, no client-side JS needed for redirect.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  redirect('/login');
}
