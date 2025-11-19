// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // ...any other providers
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Put the DB user id into the JWT
    async jwt({ token, user }) {
      if (user) {
        // user.id comes from Prisma adapter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.id = (user as any).id;
      }
      return token;
    },

    // Then copy it onto session.user
    async session({ session, token }) {
      if (session.user && token.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};
