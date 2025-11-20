// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // ✅ No adapter – use pure JWT sessions so we don't need DB writes in production
  // adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Use JWT-based sessions (default when no adapter)
  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Put a stable id into the JWT
    async jwt({ token, user }) {
      if (user) {
        // When not using Prisma, user.id will be the provider id (Google sub)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.id = (user as any).id ?? token.sub;
      }
      return token;
    },

    // Then copy it onto session.user so you can use session.user.id in the app
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = (token as any).id ?? token.sub;
      }
      return session;
    },
  },
};
