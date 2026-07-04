import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const DEMO_USERS: Record<string, { id: string; email: string; name: string; role: string; passwordHash: string }> = {
  "coach@demo.com": {
    id: "demo-coach-001",
    email: "coach@demo.com",
    name: "ליאור זיו",
    role: "COACH",
    passwordHash: "$2b$10$uw3l3EbMDVK3GR26puAt.e2/oU0IiyBKiCMCNN6kRIH/g/A7GfJNe",
  },
  "trainee@demo.com": {
    id: "demo-trainee-001",
    email: "trainee@demo.com",
    name: "אבי מתאמן",
    role: "TRAINEE",
    passwordHash: "$2b$10$uw3l3EbMDVK3GR26puAt.e2/oU0IiyBKiCMCNN6kRIH/g/A7GfJNe",
  },
};

// demo1234 hashed with bcrypt (cost 10)

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        // Skip DB entirely if URL is not configured — go straight to demo users
        if (isDatabaseConfigured) {
          try {
            const user = await prisma.user.findUnique({
              where: { email: parsed.data.email },
              select: { id: true, email: true, name: true, role: true, image: true, passwordHash: true },
            });

            if (user && user.passwordHash) {
              const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
              if (!valid) return null;
              return { id: user.id, email: user.email, name: user.name, role: user.role as string, image: user.image };
            }
          } catch {
            // DB error — fall through to demo users
          }
        }

        // Demo mode fallback
        const demo = DEMO_USERS[parsed.data.email];
        if (!demo) return null;
        const validDemo = await bcrypt.compare(parsed.data.password, demo.passwordHash);
        if (!validDemo) return null;
        return { id: demo.id, email: demo.email, name: demo.name, role: demo.role };
      },
    }),
  ],
});
