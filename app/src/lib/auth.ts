/**
 * siHutang — NextAuth Configuration
 *
 * ECC security-review:
 * - JWT stored in httpOnly cookie
 * - PIN hashed with bcrypt
 * - Role in JWT payload for middleware checks
 * - Error messages don't leak internal data
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'PIN Login',
      credentials: {
        role: { label: 'Role', type: 'text' },
        pin: { label: 'PIN', type: 'password' },
      },
      async authorize(credentials) {
        // ECC: Validate input at boundary
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { role, pin } = parsed.data;

        // Find user by role
        const user = await prisma.user.findFirst({
          where: { role },
        });

        if (!user) {
          return null;
        }

        // Verify PIN against bcrypt hash
        const isValidPin = await bcrypt.compare(pin, user.pin);
        if (!isValidPin) {
          return null;
        }

        // Return user data for JWT
        return {
          id: user.id,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign in, add role to token
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
});
