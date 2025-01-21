import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error("Supabase environment variables are not set!");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "supabase-auth",
      name: "Supabase Auth",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

          if (authError || !authData.session || !authData.user) {
            console.error("Supabase authentication error:", authError);
            return null;
          }

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, role, full_name")
            .eq("auth_id", authData.user.id)
            .single();

          if (userError || !userData) {
            console.error("Error fetching user data:", userError);
            return null;
          }

          return {
            id: authData.user.id,
            email: authData.user.email,
            name: userData.full_name || authData.user.email,
            role: userData.role || "user",
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      if (token.accessToken) {
        try {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: token.refreshToken,
          });

          if (!error && data?.session) {
            token.accessToken = data.session.access_token;
            token.refreshToken = data.session.refresh_token;
          }
        } catch (error) {
          console.error("Error during token refresh:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: session.user?.email ?? "",
        name: session.user?.name ?? "",
        role: token.role,
        accessToken: token.accessToken,
      };
      return session;
    },
  },
  events: {
    async signOut() {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during Supabase sign-out:", error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
