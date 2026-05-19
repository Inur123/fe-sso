import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "SSO IPNU-IPPNU Magetan",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const json = await res.json();

          if (!res.ok || !json.success) return null;

          const { access_token, refresh_token, user } = json.data;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image || null,
            role: user.role,
            accessToken: access_token,
            refreshToken: refresh_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama — simpan data dari authorize()
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role;
        token.image = user.image;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },

    async session({ session, token }) {
      // Kirim data ke client-side session
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.role = token.role as string;
      session.user.image = token.image as string;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  },
  cookies: {
    sessionToken: {
      name: "sso.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
});
