import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@/utils/supabase/server";

const supabase = createClient();

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
          console.error("Missing credentials");
          throw new Error("Email and password are required.");
        }
        try {
          // Step 1: Authenticate with Supabase
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

          if (authError || !authData.session || !authData.user) {
            console.error("Supabase auth failed:", authError?.message);
            return null;
          }

          console.log("Auth successful for:", credentials.email);

          // Step 2: Get user profile data from 'profiles' table
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select('*')
            .eq("auth_id", authData.user.id)
            .single();

          if (profileError || !profileData) {
            console.error("Profile fetch failed:", profileError?.message);
            return null;
          }

          console.log("User role:", profileData.role);

          // Accept both admin and student roles - don't filter here
          // We'll handle access control at the route level instead
          if (!["admin", "leadership"].includes(profileData.role)) {
            console.error("Invalid role:", profileData.role);
            return null;
          }

          // Return user data including role - IMPORTANT: don't exclude students
          return {
            id: profileData.id.toString(),
            email: authData.user.email,
            name: profileData.full_name || authData.user.email,
            role: profileData.role, // Keep the role as is
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
    signIn: "/admin",
    error: "/admin",
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