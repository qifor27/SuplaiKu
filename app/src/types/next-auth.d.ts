/**
 * siHutang — NextAuth Type Augmentation
 *
 * Extend NextAuth types to include role in session and JWT.
 */

import 'next-auth';
import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'OWNER' | 'EMPLOYEE';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'OWNER' | 'EMPLOYEE';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'OWNER' | 'EMPLOYEE';
  }
}
